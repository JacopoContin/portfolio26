import { DATA } from "@/data/resume";
import { SYSTEM_PROMPT } from "@/lib/ask/knowledge";

/**
 * Streams answers from any OpenAI-compatible chat API. Defaults to OpenRouter's
 * free models router; point LLM_BASE_URL/LLM_MODEL at Gemini, Groq, etc.
 */
const BASE_URL = process.env.LLM_BASE_URL ?? "https://openrouter.ai/api/v1";
/**
 * Tried in order: a model that is overloaded, rate limited, missing or out of
 * credit hands over to the next. A cheap paid model first for steady quality,
 * then OpenRouter's free router so the panel keeps answering.
 */
const MODELS = (process.env.LLM_MODEL ?? "anthropic/claude-haiku-5.5,openrouter/free")
  .split(",")
  .map((model) => model.trim())
  .filter(Boolean);
// 402 is OpenRouter's "out of credits".
const RETRYABLE_STATUSES = new Set([402, 404, 429, 500, 502, 503]);

const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 2000;
const MAX_QUOTE_CHARS = 1500;

// Best effort per-instance throttle, enough to stop a single visitor burning the free quota.
const RATE_LIMIT = { windowMs: 60_000, max: 10 };
const hits = new Map<string, number[]>();

function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT.max;
}

type ChatMessage = { role: "user" | "assistant"; content: string };

function parseBody(body: unknown): { messages: ChatMessage[]; quote?: string } | null {
  if (!body || typeof body !== "object") return null;
  const { messages, quote } = body as { messages?: unknown; quote?: unknown };
  if (!Array.isArray(messages) || messages.length === 0) return null;

  const clean: ChatMessage[] = [];
  for (const message of messages.slice(-MAX_MESSAGES)) {
    const { role, content } = (message ?? {}) as Partial<ChatMessage>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) return null;
    clean.push({ role, content: content.slice(0, MAX_MESSAGE_CHARS) });
  }
  if (clean[clean.length - 1].role !== "user") return null;

  return {
    messages: clean,
    quote: typeof quote === "string" && quote.trim() ? quote.trim().slice(0, MAX_QUOTE_CHARS) : undefined,
  };
}

export async function POST(request: Request) {
  // Trimmed because keys pasted into dashboards often pick up a trailing newline.
  const apiKey = process.env.LLM_API_KEY?.trim();
  if (!apiKey) return new Response("The assistant isn't configured yet.", { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(ip)) return new Response("Too many questions at once. Try again in a minute.", { status: 429 });

  const parsed = parseBody(await request.json().catch(() => null));
  if (!parsed) return new Response("Invalid request.", { status: 400 });

  const system = parsed.quote
    ? `${SYSTEM_PROMPT}\n\n# Passage the visitor highlighted on the page\n"""\n${parsed.quote}\n"""`
    : SYSTEM_PROMPT;

  let upstream: Response | null = null;
  for (const model of MODELS) {
    upstream = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        // Optional OpenRouter attribution; other providers ignore these.
        "HTTP-Referer": DATA.url,
        "X-Title": DATA.name,
      },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.4,
        max_tokens: 800,
        messages: [{ role: "system", content: system }, ...parsed.messages],
      }),
      signal: request.signal,
    }).catch(() => null);

    if (upstream?.ok || (upstream && !RETRYABLE_STATUSES.has(upstream.status))) break;
    if (model !== MODELS[MODELS.length - 1]) {
      console.warn("LLM model failed, trying next", model, upstream?.status, await upstream?.text().catch(() => ""));
    }
  }

  if (!upstream?.ok || !upstream.body) {
    const status = upstream?.status === 429 ? 429 : 502;
    console.error("LLM request failed", upstream?.status, await upstream?.text().catch(() => ""));
    return new Response(
      status === 429
        ? "The assistant is busy right now. Try again in a minute."
        : `The assistant is unavailable right now (${upstream ? `model API returned ${upstream.status}` : "model API unreachable"}).`,
      { status }
    );
  }

  // Unwrap the SSE stream into plain text deltas so the client stays trivial.
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = "";
  const text = upstream.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        buffer += decoder.decode(chunk, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const data = line.trim();
          if (!data.startsWith("data:")) continue;
          const payload = data.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const delta = JSON.parse(payload).choices?.[0]?.delta?.content;
            if (typeof delta === "string" && delta) controller.enqueue(encoder.encode(delta));
          } catch {
            // Partial or keep-alive line; skip it.
          }
        }
      },
    })
  );

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
  });
}

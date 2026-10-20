import BlurFade from "@/components/magicui/blur-fade";
import { RecordShelf } from "@/components/record-shelf";
import { VideoCard } from "@/components/video-card";
import { DATA } from "@/data/resume";
import { fetchSpotifyCover, toSpotifyUri } from "@/lib/spotify";

const BLUR_FADE_DELAY = 0.04;

export default async function MusicSection() {
  const records = await Promise.all(
    DATA.music.onRepeat.map(async ({ url, artist, title }) => ({
      uri: toSpotifyUri(url),
      artist,
      title,
      cover: await fetchSpotifyCover(url),
    }))
  );

  return (
    <section id="music">
      <div className="flex min-h-0 flex-col gap-y-8">
        <div className="flex flex-col gap-y-4 items-center justify-center">
          <div className="flex items-center w-full">
            <div className="flex-1 h-px bg-linear-to-r from-transparent from-5% via-border via-95% to-transparent" />
            <div className="border bg-primary z-10 rounded-xl px-4 py-1">
              <span className="text-background text-sm font-medium">Music</span>
            </div>
            <div className="flex-1 h-px bg-linear-to-l from-transparent from-5% via-border via-95% to-transparent" />
          </div>
          <div className="flex flex-col gap-y-3 items-center justify-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              What I listen to, what I play
            </h2>
            <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed text-balance text-center">
              A mix of what currently inspires me, plus a few original cuts and
              live recordings from my time gigging around Bangkok.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-10 max-w-200 mx-auto w-full">
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-medium uppercase tracking-label text-muted-foreground">
              On repeat
            </h3>
            <BlurFade delay={BLUR_FADE_DELAY * 12}>
              <RecordShelf records={records} />
            </BlurFade>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-medium uppercase tracking-label text-muted-foreground">
              Sessions &amp; live
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 auto-rows-fr">
              {DATA.music.sessions.map((session, id) => (
                <BlurFade
                  key={session.videoId}
                  delay={BLUR_FADE_DELAY * 13 + id * 0.05}
                  className="h-full"
                >
                  <VideoCard
                    videoId={session.videoId}
                    title={session.title}
                    description={session.description}
                  />
                </BlurFade>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

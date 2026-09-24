import BlurFade from "@/components/magicui/blur-fade";
import { VideoCard } from "@/components/video-card";
import { DATA } from "@/data/resume";

const BLUR_FADE_DELAY = 0.04;

export default function TalksSection() {
  return (
    <section id="talks">
      <div className="flex min-h-0 flex-col gap-y-8">
        <div className="flex flex-col gap-y-4 items-center justify-center">
          <div className="flex items-center w-full">
            <div className="flex-1 h-px bg-linear-to-r from-transparent from-5% via-border via-95% to-transparent" />
            <div className="border bg-primary z-10 rounded-xl px-4 py-1">
              <span className="text-background text-sm font-medium">
                Interviews &amp; Talks
              </span>
            </div>
            <div className="flex-1 h-px bg-linear-to-l from-transparent from-5% via-border via-95% to-transparent" />
          </div>
          <div className="flex flex-col gap-y-3 items-center justify-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              Conversations
            </h2>
            <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed text-balance text-center">
              Podcasts and interviews on product design, fintech, and how teams
              actually build things.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 max-w-200 mx-auto auto-rows-fr">
          {DATA.talks.map((talk, id) => (
            <BlurFade
              key={talk.videoId}
              delay={BLUR_FADE_DELAY * 12 + id * 0.05}
              className="h-full"
            >
              <VideoCard
                videoId={talk.videoId}
                title={talk.title}
                description={talk.description}
              />
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

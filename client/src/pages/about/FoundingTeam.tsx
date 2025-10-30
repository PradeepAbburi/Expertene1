import { BackButton } from '@/components/BackButton';
import { Helmet } from 'react-helmet-async';

export default function FoundingTeam(): JSX.Element {
  return (
    <div className="w-full px-6 py-12">
      <Helmet>
        <title>Founding team — Expertene</title>
        <meta name="description" content="Meet the founders and core team behind Expertene — building the community-powered platform for sharing expertise." />
        <link rel="canonical" href="https://expertene.tech/about/founding-team" />
        <meta property="og:title" content="Founding team — Expertene" />
        <meta property="og:description" content="Meet the founders and core team behind Expertene — building the community-powered platform for sharing expertise." />
        <meta property="og:url" content="https://expertene.tech/about/founding-team" />
        <meta property="og:image" content="https://expertene.tech/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Founding team — Expertene" />
        <meta name="twitter:description" content="Meet the founders and core team behind Expertene — building the community-powered platform for sharing expertise." />
      </Helmet>
      <div className="mb-6">
        <BackButton />
      </div>

      <h1 className="text-2xl font-bold mb-4">Founding team</h1>

      <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <img src="/assets/team/pradeepabburi.jpg" alt="Pradeep Abburi" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-medium">Pradeep Abburi</div>
              <div className="text-xs text-muted-foreground">Co-founder & CEO — Product, community and strategy.</div>
              <div className="mt-2"><a href="https://www.linkedin.com/in/pradeep-abburi-a88929252/" target="_blank" rel="noreferrer" className="underline">LinkedIn</a></div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <img src="/assets/team/devika.jpg" alt="Venkatnarayan Karanam" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-medium">Venkatnarayan Karanam</div>
              <div className="text-xs text-muted-foreground">Co-founder & CTO — Architecture, infrastructure and developer experience.</div>
              <div className="mt-2"><a href="https://www.linkedin.com/in/venkatnarayan-karanam-868417276/" target="_blank" rel="noreferrer" className="underline">LinkedIn</a></div>
            </div>
          </div>

          <hr />

          <div className="flex items-start gap-3">
            <img src="/assets/team/amar.jpg" alt="Hari Prasad Chilimili" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-medium">Hari Prasad Chilimili</div>
              <div className="text-xs text-muted-foreground">Founding Team — Developer.</div>
              <div className="mt-2"><a href="https://www.linkedin.com/in/haripch/" target="_blank" rel="noreferrer" className="underline">LinkedIn</a></div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <img src="/assets/team/rahul.jpg" alt="Gowtham Juttiga" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-medium">Gowtham Juttiga</div>
              <div className="text-xs text-muted-foreground">Founding Team — Developer.</div>
              <div className="mt-2"><a href="https://www.linkedin.com/in/juttiga-gowtham-a5bb4b290/" target="_blank" rel="noreferrer" className="underline">LinkedIn</a></div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <img src="/assets/team/sneha.jpg" alt="Rishanth Midde" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-medium">Rishanth Midde</div>
              <div className="text-xs text-muted-foreground">Founding Team — Developer.</div>
              <div className="mt-2"><a href="https://www.linkedin.com/in/rishanth-midde/" target="_blank" rel="noreferrer" className="underline">LinkedIn</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

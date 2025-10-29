import { BackButton } from '@/components/BackButton';

export default function FoundingTeam(): JSX.Element {
  return (
    <div className="w-full px-6 py-12">
      <div className="mb-6">
        <BackButton />
      </div>

      <h1 className="text-2xl font-bold mb-4">Founding team</h1>

      <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <div className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <img src="/assets/team/pradeep.jpg" alt="Pradeep Abburi" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-medium">Pradeep Abburi</div>
              <div className="text-xs text-muted-foreground">Co-founder & CEO — Product, community and strategy.</div>
              <div className="mt-2"><a href="https://www.linkedin.com/in/pradeep" target="_blank" rel="noreferrer" className="underline">LinkedIn</a></div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <img src="/assets/team/devika.jpg" alt="Devika Rao" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-medium">Devika Rao</div>
              <div className="text-xs text-muted-foreground">Co-founder & CTO — Architecture, infrastructure and developer experience.</div>
              <div className="mt-2"><a href="https://www.linkedin.com/in/devikar" target="_blank" rel="noreferrer" className="underline">LinkedIn</a></div>
            </div>
          </div>

          <hr />

          <div className="flex items-start gap-3">
            <img src="/assets/team/amar.jpg" alt="Amar Singh" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-medium">Amar Singh</div>
              <div className="text-xs text-muted-foreground">Senior Engineer — Core platform and integrations.</div>
              <div className="mt-2"><a href="https://www.linkedin.com/in/amar" target="_blank" rel="noreferrer" className="underline">LinkedIn</a></div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <img src="/assets/team/rahul.jpg" alt="Rahul Kumar" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-medium">Rahul Kumar</div>
              <div className="text-xs text-muted-foreground">Frontend Engineer — UI, accessibility and editor experience.</div>
              <div className="mt-2"><a href="https://www.linkedin.com/in/rahulkumar" target="_blank" rel="noreferrer" className="underline">LinkedIn</a></div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <img src="/assets/team/sneha.jpg" alt="Sneha Patel" className="w-12 h-12 rounded-full object-cover" />
            <div>
              <div className="font-medium">Sneha Patel</div>
              <div className="text-xs text-muted-foreground">Backend Engineer — APIs, data and integrations.</div>
              <div className="mt-2"><a href="https://www.linkedin.com/in/snehapatel" target="_blank" rel="noreferrer" className="underline">LinkedIn</a></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

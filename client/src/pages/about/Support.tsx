import { BackButton } from '@/components/BackButton';

export default function Support(): JSX.Element {
  return (
    <div className="w-full px-6 py-12">
      <div className="mb-6">
        <BackButton />
      </div>

      <h1 className="text-2xl font-bold mb-4">Support & Docs</h1>

      <div className="bg-card border border-border rounded-lg p-6 shadow-soft">
        <p className="mt-2 text-sm text-muted-foreground">For technical questions and integration details, reach out at <a className="underline" href="mailto:support@expertene.example">support@expertene.example</a>.</p>
      </div>
    </div>
  );
}

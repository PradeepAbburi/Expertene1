import { BackButton } from '@/components/BackButton';

const faqItems = [
  {
    q: 'Can I import articles from other platforms?',
    a: 'We offer basic import tools (Markdown/HTML). For larger migrations, contact support and we can assist with a customized import.',
  },
  {
    q: 'How are mentions rendered?',
    a: 'Mentions are saved as safe profile links and rendered in the preview as clickable links that open in a new tab.',
  },
  {
    q: 'Does the editor support code syntax highlighting and line numbers?',
    a: 'Yes — the editor supports code blocks with syntax highlighting, preserved tab/space rendering, and optional collapsed previews with line numbers.',
  },
  {
    q: 'Can I export my content?',
    a: 'You can export article content in Markdown or HTML formats from your profile settings or via the article actions menu.',
  },
  {
    q: 'How do I report abusive content?',
    a: 'Use the report button on the content in question or reach out to support@expertene.example. We review reports promptly and take action per our community guidelines.',
  },
  {
    q: 'Is there an API for integrations?',
    a: 'We provide a developer-focused API for select partners. Contact us with your use case and we can discuss access and rate limits.',
  },
];

export default function FAQ(): JSX.Element {
  return (
    <div className="w-full px-6 py-12">
      <div className="mb-6">
        <BackButton />
      </div>

      <h1 className="text-2xl font-bold mb-4">FAQ</h1>

      <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground shadow-soft">
        <div className="mt-2 space-y-2">
          {faqItems.map((item, idx) => (
            <div key={idx} className="border-b border-border last:border-b-0 py-2">
              <div className="font-semibold">{item.q}</div>
              <div className="text-sm text-muted-foreground mt-1">{item.a}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

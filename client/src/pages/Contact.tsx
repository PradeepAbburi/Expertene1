import { BackButton } from "@/components/BackButton";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export default function Contact() {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({ title: 'Missing fields', description: 'Please provide name, email and message.', variant: 'destructive' });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: 'Invalid email', description: 'Please enter a valid email address.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      // Attempt to insert into supabase contacts table if available. Cast to any to avoid TS typing errors when table is not present in generated types.
      const { error } = await (supabase as any).from('contacts').insert([{ name, email, subject, message }]);
      if (error) {
        console.warn('Supabase insert failed for contacts table:', error.message);
        console.log({ name, email, subject, message });
      }

  setName('');
  setEmail('');
  setSubject('');
  setMessage('');
  setSuccess(true);

  toast({ title: 'Message sent', description: 'Thanks — we will get back to you soon.' });
    } catch (err) {
      console.error('Error submitting contact:', err);
      toast({ title: 'Error', description: 'Unable to send message. Please try again later.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="w-full px-6 py-12">
      <div className="mb-6">
        <BackButton />
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-lg text-muted-foreground">Get in touch with the Expertene team for support, partnerships, or feedback.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        <div className="bg-card border border-border rounded-lg p-6 shadow-soft h-full">
          <h2 className="text-xl font-semibold mb-3">Send us a message</h2>
          <p className="text-sm text-muted-foreground mb-4">We typically reply within 1–2 business days.</p>

          <form onSubmit={submit} className="space-y-4 h-full">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" aria-label="Name" />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" aria-label="Email" />
            </div>

            <div>
              <Label htmlFor="subject">Subject <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" aria-label="Subject" />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Write your message here..." aria-label="Message" />
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
              {success && <span className="text-green-400 text-sm">Thanks — we received your message.</span>}
            </div>
          </form>
        </div>

  <aside className="space-y-6 flex flex-col">
          <div className="bg-card border border-border rounded-lg p-4 shadow-soft">
            <h3 className="font-semibold">Our location</h3>
            <p className="text-sm text-muted-foreground">Visakhapatnam (Vizag), India</p>

            <dl className="mt-3 text-sm text-muted-foreground space-y-1">
              <div>
                <dt className="sr-only">Address</dt>
                <dd>Vizag, Andhra Pradesh, India</dd>
              </div>
              <div>
                <dt className="sr-only">Email</dt>
                <dd><a className="underline" href="mailto:support@expertene.example">support@expertene.example</a></dd>
              </div>
              <div>
                <dt className="sr-only">Hours</dt>
                <dd>Mon — Fri, 9:00 — 18:00 IST</dd>
              </div>
            </dl>
          </div>

          <div className="w-full rounded-lg overflow-hidden border border-border shadow-soft relative bg-black flex-1 min-h-[220px]">
            {/* Full-bleed iframe map */}
            <iframe
              title="Visakhapatnam map"
              src="https://www.google.com/maps?q=Visakhapatnam,India&z=12&output=embed"
              className="absolute inset-0 w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-popups"
            />

            {/* Center pin (visual only) */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
              <svg viewBox="0 0 24 24" width="36" height="36" className="text-rose-500 drop-shadow-lg" fill="currentColor" aria-hidden>
                <path d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
            </div>

            {/* Bottom-left translucent info overlay */}
            <div className="absolute left-4 bottom-4 bg-black/60 text-white rounded-md px-3 py-2 text-sm backdrop-blur-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z" />
                <circle cx="12" cy="10" r="2" fill="currentColor" />
              </svg>
              <span>Visakhapatnam, India</span>
              <a href="https://www.google.com/maps?q=Visakhapatnam,India" target="_blank" rel="noreferrer" className="underline ml-2 text-xs">Open</a>
            </div>

            {/* Top-right zoom UI (visual only) */}
            <div className="absolute right-4 top-4 flex flex-col gap-2">
              <button type="button" aria-label="Zoom in" className="bg-card/70 text-foreground rounded-md w-8 h-8 flex items-center justify-center shadow">+</button>
              <button type="button" aria-label="Zoom out" className="bg-card/70 text-foreground rounded-md w-8 h-8 flex items-center justify-center shadow">−</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

import { WifiOff, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Offline() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full text-center p-6">
        <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <WifiOff className="h-8 w-8 text-muted-foreground" />
        </div>
  <h1 className="text-2xl font-bold mb-2">You are offline</h1>
        <p className="text-muted-foreground mb-6">
          It looks like there’s no internet connection. Check your network and try again.
        </p>
        <div className="flex items-center justify-center">
          <Button variant="outline" onClick={() => window.location.reload()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Retry
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-6">
          Tip: Some pages may still work if they were opened before going offline.
        </p>
      </div>
    </div>
  );
}

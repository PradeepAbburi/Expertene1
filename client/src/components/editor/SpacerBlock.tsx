import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { X, Minus } from 'lucide-react';

interface SpacerContent {
  height?: number; // pixels
}

interface SpacerBlockProps {
  content: SpacerContent;
  onChange: (content: SpacerContent) => void;
  onDelete: () => void;
}

export function SpacerBlock({ content, onChange, onDelete }: SpacerBlockProps) {
  const [height, setHeight] = useState<number>(content.height ?? 24);

  const onHeightChange = (value: number[]) => {
    const h = value[0];
    setHeight(h);
    onChange({ height: h });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Minus className="h-4 w-4" />
          Spacer
        </h4>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div>
        <Label htmlFor="spacer-height">Height: {height}px</Label>
        <Slider
          id="spacer-height"
          min={8}
          max={128}
          step={4}
          value={[height]}
          onValueChange={onHeightChange}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>8px</span>
          <span>64px</span>
          <span>128px</span>
        </div>
      </div>

      <div className="relative">
        <div
          style={{ height }}
          className="bg-muted rounded-md border border-border"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground bg-background/60 px-2 py-0.5 rounded">
            Spacer · {height}px
          </span>
        </div>
      </div>
    </div>
  );
}

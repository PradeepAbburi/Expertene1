import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, GripVertical } from 'lucide-react';
import { TextBlock } from './TextBlock';
import { ImageBlock } from './ImageBlock';
import { VideoBlock } from './VideoBlock';
import { CodeBlock } from './CodeBlock';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Block {
  id: string | null | undefined;
  type: 'text' | 'image' | 'video' | 'code';
  content: any;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export function BlockEditor({ blocks, onChange }: BlockEditorProps) {
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  const addBlock = (type: Block['type'], index: number) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: type === 'text' ? '' : type === 'image' ? { url: '', alt: '', caption: '' } : type === 'video' ? { url: '', caption: '' } : { code: '', language: 'javascript', label: '' }
    };
    
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onChange(newBlocks);
  setActiveBlock(newBlock.id as string | null);
  };

  const updateBlock = (id: string, content: any) => {
    const newBlocks = blocks.map(block => 
      block.id === id ? { ...block, content } : block
    );
    onChange(newBlocks);
  };

  const deleteBlock = (id: string) => {
    const newBlocks = blocks.filter(block => block.id !== id);
    onChange(newBlocks);
  };

  // moveBlock removed (unused). Reintroduce later if drag/move controls are wired.

  const renderBlock = (block: Block, index: number) => {
    const isActive = activeBlock === block.id;
    
    return (
      <div key={block.id} className="group relative">
        {/* Block Content */}
        <Card className={`transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}>
          <div className="relative">
            {/* Block Controls */}
              <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex flex-col gap-1">
                <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 cursor-grab"
                onMouseDown={() => setActiveBlock(block.id as string | null)}
              >
                <GripVertical className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Block Content Renderer */}
            <div className="p-4">
              {block.type === 'text' && (
                <TextBlock
                  content={block.content}
                  onChange={(content) => updateBlock(block.id as string, content)}
                  onFocus={() => setActiveBlock(block.id as string | null)}
                  onBlur={() => setActiveBlock(null)}
                />
              )}
              {block.type === 'image' && (
                <ImageBlock
                  content={block.content}
                  onChange={(content) => updateBlock(block.id as string, content)}
                  onDelete={() => deleteBlock(block.id as string)}
                />
              )}
              {block.type === 'video' && (
                <VideoBlock
                  content={block.content}
                  onChange={(content) => updateBlock(block.id as string, content)}
                  onDelete={() => deleteBlock(block.id as string)}
                />
              )}
              {block.type === 'code' && (
                <CodeBlock
                  content={block.content}
                  onChange={(content) => updateBlock(block.id as string, content)}
                  onDelete={() => deleteBlock(block.id as string)}
                />
              )}
            </div>
          </div>
        </Card>
        
        {/* Add Block Button */}
        <div className="flex justify-center my-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => addBlock('text', index)}>
                📝 Text
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('image', index)}>
                🖼️ Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('video', index)}>
                🎥 Video
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => addBlock('code', index)}>
                💻 Code
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  // If no blocks, show initial add button
  if (blocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Start creating your page by adding content blocks</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add First Block
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem onClick={() => addBlock('text', -1)}>
              📝 Text
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlock('image', -1)}>
              🖼️ Image
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlock('video', -1)}>
              🎥 Video
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => addBlock('code', -1)}>
              💻 Code
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="space-y-0 sm:pl-12">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
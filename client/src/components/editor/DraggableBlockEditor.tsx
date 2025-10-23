import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, ChevronUp, ChevronDown, Type, Image, Video, Code, Table, Minus } from 'lucide-react';
import { TextBlock } from './TextBlock';
import { ImageBlock } from './ImageBlock';
import { VideoBlock } from './VideoBlock';
import { CodeBlock } from './CodeBlock';
import { TableBlock } from './TableBlock';
import { SpacerBlock } from './SpacerBlock';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export interface Block {
  id: string | null | undefined;
  type: 'text' | 'image' | 'video' | 'code' | 'table' | 'spacer';
  // new: spacer block type
  // extending union below
  content: any;
}

interface DraggableBlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export function DraggableBlockEditor({ blocks, onChange }: DraggableBlockEditorProps) {
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  const addBlock = (type: Block['type'] | 'spacer', index: number) => {
    const newBlock: Block = {
      id: `block-${Date.now()}-${Math.random()}`,
      type: (type as any),
      content: type === 'text'
        ? ''
        : type === 'image'
        ? { url: '', alt: '', caption: '' }
        : type === 'video'
        ? { url: '', caption: '' }
        : type === 'code'
        ? { code: '', language: 'javascript' }
        : type === 'table'
        ? { headers: ['Column 1', 'Column 2'], rows: [['', ''], ['', '']] }
        : { height: 24 }
    };
    
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, newBlock);
    onChange(newBlocks);
    setActiveBlock(newBlock.id);
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

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    onChange(newBlocks);
  };

  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    onChange(newBlocks);
  };

  const renderBlock = (block: Block, index: number) => {
    const isActive = activeBlock === block.id;
    
    return (
      <div key={block.id} className="group relative mb-4">
        <Card className={`transition-all ${isActive ? 'ring-2 ring-primary' : ''}`}>
          <div className="relative">
            {/* Move Up/Down Buttons */}
            <div className="absolute -left-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex flex-col gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => moveBlockUp(index)}
                disabled={index === 0}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => moveBlockDown(index)}
                disabled={index === blocks.length - 1}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>

            {/* Delete Button */}
            <div className="absolute -right-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                onClick={() => deleteBlock(block.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            
            {/* Block Content */}
            <div className="p-4">
                  {block.type === 'text' && (
                    <TextBlock
                      content={block.content}
                      onChange={(content) => updateBlock(block.id, content)}
                      onFocus={() => setActiveBlock(block.id)}
                      onBlur={() => setActiveBlock(null)}
                    />
                  )}
                  {block.type === 'image' && (
                    <ImageBlock
                      content={block.content}
                      onChange={(content) => updateBlock(block.id, content)}
                      onDelete={() => deleteBlock(block.id)}
                    />
                  )}
                  {block.type === 'video' && (
                    <VideoBlock
                      content={block.content}
                      onChange={(content) => updateBlock(block.id, content)}
                      onDelete={() => deleteBlock(block.id)}
                    />
                  )}
                  {block.type === 'code' && (
                    <CodeBlock
                      content={block.content}
                      onChange={(content) => updateBlock(block.id, content)}
                      onDelete={() => deleteBlock(block.id)}
                    />
                  )}
                  {block.type === 'table' && (
                    <TableBlock
                      content={block.content}
                      onChange={(content) => updateBlock(block.id, content)}
                      onDelete={() => deleteBlock(block.id)}
                    />
                  )}
                  {(block as any).type === 'spacer' && (
                    <SpacerBlock
                      content={block.content}
                      onChange={(content) => updateBlock(block.id, content)}
                      onDelete={() => deleteBlock(block.id)}
                    />
                  )}
                </div>
              </div>
            </Card>
            
            {/* Add Block Button */}
            <div className="flex justify-center my-2">
              <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3"
                  onClick={() => addBlock('text', index)}
                  title="Add Text"
                >
                  <Type className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3"
                  onClick={() => addBlock('image', index)}
                  title="Add Image"
                >
                  <Image className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3"
                  onClick={() => addBlock('video', index)}
                  title="Add Video"
                >
                  <Video className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3"
                  onClick={() => addBlock('code', index)}
                  title="Add Code"
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3"
                  onClick={() => addBlock('table', index)}
                  title="Add Table"
                >
                  <Table className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 px-3"
                  onClick={() => addBlock('spacer' as any, index)}
                  title="Add Spacer"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
    );
  };

  // If no blocks, show initial add button
  if (blocks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">Start creating your page by adding content blocks</p>
        <div className="flex items-center justify-center gap-2">
          <Button onClick={() => addBlock('text', -1)} variant="outline">
            <Type className="h-4 w-4 mr-2" />
            Text
          </Button>
          <Button onClick={() => addBlock('image', -1)} variant="outline">
            <Image className="h-4 w-4 mr-2" />
            Image
          </Button>
          <Button onClick={() => addBlock('video', -1)} variant="outline">
            <Video className="h-4 w-4 mr-2" />
            Video
          </Button>
          <Button onClick={() => addBlock('code', -1)} variant="outline">
            <Code className="h-4 w-4 mr-2" />
            Code
          </Button>
          <Button onClick={() => addBlock('table', -1)} variant="outline">
            <Table className="h-4 w-4 mr-2" />
            Table
          </Button>
          <Button onClick={() => addBlock('spacer' as any, -1)} variant="outline">
            <Minus className="h-4 w-4 mr-2" />
            Spacer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0 sm:pl-12 sm:pr-12">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
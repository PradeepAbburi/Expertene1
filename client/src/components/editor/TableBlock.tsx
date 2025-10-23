import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface TableBlockProps {
  content: {
    rows: string[][];
    headers: string[];
    width?: number;
    colWidths?: number[]; // per-column widths in % summing to ~100
  };
  onChange: (content: any) => void;
  onDelete: () => void;
}

export function TableBlock({ content, onChange, onDelete }: TableBlockProps) {
  const [data, setData] = useState(
    content.rows && content.headers
      ? content
      : { headers: ['Column 1', 'Column 2'], rows: [['', ''], ['', '']], width: 100, colWidths: [50, 50] }
  );
  const tableRef = useRef<HTMLTableElement>(null);
  const [dragState, setDragState] = useState<null | {
    index: number; // resizing boundary between index and index+1
    startX: number;
    startWidths: number[];
    tablePx: number;
  }>(null);

  const updateData = (newData: typeof data) => {
    setData(newData);
    onChange(newData);
  };

  const updateHeader = (index: number, value: string) => {
    const newHeaders = [...data.headers];
    newHeaders[index] = value;
    updateData({ ...data, headers: newHeaders });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = [...data.rows];
    newRows[rowIndex][colIndex] = value;
    updateData({ ...data, rows: newRows });
  };

  const addRow = () => {
    const newRow = new Array(data.headers.length).fill('');
    updateData({ ...data, rows: [...data.rows, newRow] });
  };

  const addColumn = () => {
    const newHeaders = [...data.headers, `Column ${data.headers.length + 1}`];
    const newRows = data.rows.map(row => [...row, '']);
    const equal = 100 / newHeaders.length;
    const newColWidths = newHeaders.map(() => equal);
    updateData({ headers: newHeaders, rows: newRows, colWidths: newColWidths, width: data.width });
  };

  const deleteRow = (index: number) => {
    if (data.rows.length <= 1) return;
    const newRows = data.rows.filter((_, i) => i !== index);
    updateData({ ...data, rows: newRows });
  };

  const deleteColumn = (index: number) => {
    if (data.headers.length <= 1) return;
    const newHeaders = data.headers.filter((_, i) => i !== index);
    const newRows = data.rows.map(row => row.filter((_, i) => i !== index));
    const equal = 100 / newHeaders.length;
    const newColWidths = newHeaders.map(() => equal);
    updateData({ headers: newHeaders, rows: newRows, colWidths: newColWidths, width: data.width });
  };

  const moveRow = (from: number, to: number) => {
    if (to < 0 || to >= data.rows.length) return;
    const newRows = [...data.rows];
    const [removed] = newRows.splice(from, 1);
    newRows.splice(to, 0, removed);
    updateData({ ...data, rows: newRows });
  };

  const moveColumn = (from: number, to: number) => {
    if (to < 0 || to >= data.headers.length) return;
    const newHeaders = [...data.headers];
    const [h] = newHeaders.splice(from, 1);
    newHeaders.splice(to, 0, h);
    const newRows = data.rows.map(row => {
      const r = [...row];
      const [cell] = r.splice(from, 1);
      r.splice(to, 0, cell);
      return r;
    });
    let newColWidths = data.colWidths ? [...data.colWidths] : new Array(newHeaders.length).fill(100 / newHeaders.length);
    const [w] = newColWidths.splice(from, 1);
    newColWidths.splice(to, 0, w);
    updateData({ headers: newHeaders, rows: newRows, width: data.width, colWidths: newColWidths });
  };

  // Removed overall width slider per request; keeping width in content for backward compatibility

  const startResize = (e: React.MouseEvent, index: number) => {
    if (!tableRef.current) return;
    const rect = tableRef.current.getBoundingClientRect();
    const tablePx = rect.width;
    // Normalize colWidths
    const colCount = data.headers.length;
    const colWidths = data.colWidths && data.colWidths.length === colCount
      ? [...data.colWidths]
      : new Array(colCount).fill(100 / colCount);
    setDragState({ index, startX: e.clientX, startWidths: colWidths, tablePx });
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (!dragState) return;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - dragState.startX;
      const deltaPercent = (dx / dragState.tablePx) * 100;
      const i = dragState.index;
      const widths = [...dragState.startWidths];
      const min = 8; // percent min col width
      let left = Math.max(min, widths[i] + deltaPercent);
      let right = Math.max(min, widths[i + 1] - deltaPercent);
      // Adjust if sum overflow due to min constraints
      const sumPair = left + right;
      const originalPair = widths[i] + widths[i + 1];
      if (sumPair !== originalPair) {
        // Rebalance to keep total the same
        if (left + right > originalPair) {
          const extra = sumPair - originalPair;
          if (left > right) left -= extra; else right -= extra;
        } else {
          const deficit = originalPair - sumPair;
          if (left < right) left += deficit; else right += deficit;
        }
      }
      widths[i] = left;
      widths[i + 1] = right;
      updateData({ ...data, colWidths: widths });
    };
    const onUp = () => setDragState(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp, { once: true });
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragState]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto flex justify-center">
        <div style={{ width: `${data.width || 100}%` }}>
        <table ref={tableRef} className="w-full border-collapse border border-border relative">
          {(() => {
            const colCount = data.headers.length;
            const colWidths = data.colWidths && data.colWidths.length === colCount
              ? data.colWidths
              : new Array(colCount).fill(100 / colCount);
            return (
              <colgroup>
                {colWidths.map((w, i) => (
                  <col key={i} style={{ width: `${w}%` }} />
                ))}
              </colgroup>
            );
          })()}
          <thead>
            <tr className="bg-muted/50">
              {data.headers.map((header, colIndex) => (
                <th key={colIndex} className="border border-border p-2 relative group">
                  <Input
                    value={header}
                    onChange={(e) => updateHeader(colIndex, e.target.value)}
                    className="font-semibold text-center border-0 bg-transparent"
                  />
                  <div className="absolute -top-2 right-6 flex gap-1 opacity-0 group-hover:opacity-100">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveColumn(colIndex, colIndex - 1)}>
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveColumn(colIndex, colIndex + 1)}>
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                  {/* Resize handle except on last column */}
                  {colIndex < data.headers.length - 1 && (
                    <div
                      onMouseDown={(e) => startResize(e, colIndex)}
                      className="absolute top-0 right-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-primary/30"
                      title="Drag to resize column"
                    />
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                    onClick={() => deleteColumn(colIndex)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="group">
                {row.map((cell, colIndex) => (
                  <td key={colIndex} className="border border-border p-2">
                    <Input
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      className="border-0 bg-transparent"
                      placeholder="Enter text..."
                    />
                  </td>
                ))}
                <td className="border-0 p-2 whitespace-nowrap">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveRow(rowIndex, rowIndex - 1)}>
                      <ChevronUp className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => moveRow(rowIndex, rowIndex + 1)}>
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => deleteRow(rowIndex)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button onClick={addRow} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Row
        </Button>
        <Button onClick={addColumn} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Column
        </Button>
      </div>

      {/* Overall width control removed */}
    </div>
  );
}

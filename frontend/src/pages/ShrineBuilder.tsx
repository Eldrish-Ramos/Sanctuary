import React, { useState, FC, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './ShrineBuilder.scss';

type BlockType = 'text' | 'image' | 'audio';

interface Block {
  id: string;
  type: BlockType;
  content: string;
  x: number;
  y: number;
  fontFamily?: string;
  fontSize?: string;
  color?: string;
}

const BLOCK_OPTIONS: { type: BlockType; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'image', label: 'Image' },
  { type: 'audio', label: 'Audio' },
];

const FONT_FAMILIES = [
  { label: 'Serif', value: 'serif' },
  { label: 'Sans', value: 'Arial, sans-serif' },
  { label: 'Mono', value: 'monospace' },
  { label: 'Cursive', value: 'cursive' },
];

const FONT_SIZES = [
  { label: 'S', value: '1rem' },
  { label: 'M', value: '1.3rem' },
  { label: 'L', value: '1.7rem' },
  { label: 'XL', value: '2.2rem' },
];

const COLORS = [
  '#7c2152', '#be185d', '#374151', '#111827', '#e11d48', '#f59e42', '#1d4ed8', '#059669'
];

const PaletteBlock: FC<{ type: BlockType; label: string }> = ({ type, label }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'BLOCK',
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  return (
    <div
      ref={drag as (node: HTMLDivElement | null) => void}
      className={`shrine-builder__palette-block${isDragging ? ' shrine-builder__palette-block--dragging' : ''}`}
    >
      {label}
    </div>
  );
};

const TextBlock: FC<{
  block: Block;
  onChange: (id: string, content: string) => void;
  onStyleChange: (id: string, style: Partial<Block>) => void;
}> = ({ block, onChange, onStyleChange }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Toolbar actions
  const exec = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (ref.current) {
      onChange(block.id, ref.current.innerHTML);
    }
  };

  return (
    <div>
      <div className="shrine-builder__toolbar">
        <select
          value={block.fontFamily || 'serif'}
          onChange={e => onStyleChange(block.id, { fontFamily: e.target.value })}
        >
          {FONT_FAMILIES.map(f => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
        <select
          value={block.fontSize || '1.1rem'}
          onChange={e => onStyleChange(block.id, { fontSize: e.target.value })}
        >
          {FONT_SIZES.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={block.color || '#7c2152'}
          onChange={e => onStyleChange(block.id, { color: e.target.value })}
        >
          {COLORS.map(c => (
            <option key={c} value={c} style={{ color: c }}>{c}</option>
          ))}
        </select>
        <button type="button" onClick={() => exec('bold')} title="Bold"><b>B</b></button>
        <button type="button" onClick={() => exec('italic')} title="Italic"><i>I</i></button>
        <button type="button" onClick={() => exec('underline')} title="Underline"><u>U</u></button>
      </div>
      <div
        ref={ref}
        className="shrine-builder__richtext"
        contentEditable
        suppressContentEditableWarning
        style={{
          fontFamily: block.fontFamily || 'serif',
          fontSize: block.fontSize || '1.1rem',
          color: block.color || '#7c2152',
          minHeight: 60,
        }}
        onInput={e => onChange(block.id, (e.target as HTMLDivElement).innerHTML)}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  );
};

const DropArea: FC<{
  blocks: Block[];
  onDropBlock: (type: BlockType, x: number, y: number) => void;
  updateBlockContent: (id: string, content: string) => void;
  updateBlockStyle: (id: string, style: Partial<Block>) => void;
}> = ({ blocks, onDropBlock, updateBlockContent, updateBlockStyle }) => {
  const dropAreaRef = useRef<HTMLDivElement>(null);

  const [, drop] = useDrop(
    () => ({
      accept: 'BLOCK',
      drop: (item: { type: BlockType }, monitor) => {
        const clientOffset = monitor.getClientOffset();
        const dropArea = dropAreaRef.current;
        if (clientOffset && dropArea) {
          const rect = dropArea.getBoundingClientRect();
          const x = clientOffset.x - rect.left;
          const y = clientOffset.y - rect.top;
          onDropBlock(item.type, x, y);
        }
      },
    }),
    [onDropBlock]
  );

  return (
    <div ref={node => { dropAreaRef.current = node; drop(node); }} className="shrine-builder__drop-area">
      {blocks.map(block => (
        <div
          key={block.id}
          className="shrine-builder__block"
          style={{
            position: 'absolute',
            left: block.x,
            top: block.y,
            minWidth: 180,
            minHeight: 40,
          }}
        >
          {block.type === 'text' && (
            <TextBlock
              block={block}
              onChange={updateBlockContent}
              onStyleChange={updateBlockStyle}
            />
          )}
          {block.type === 'image' && (
            <input
              className="shrine-builder__input"
              placeholder="Paste image URL..."
              value={block.content}
              onChange={e => updateBlockContent(block.id, e.target.value)}
            />
          )}
          {block.type === 'audio' && (
            <input
              className="shrine-builder__input"
              placeholder="Paste audio URL..."
              value={block.content}
              onChange={e => updateBlockContent(block.id, e.target.value)}
            />
          )}
        </div>
      ))}
      {blocks.length === 0 && (
        <div className="shrine-builder__empty">
          Drag blocks from below and drop them anywhere to start building your shrine!
        </div>
      )}
    </div>
  );
};

const ShrineBuilder = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  const onDropBlock = (type: BlockType, x: number, y: number) => {
    setBlocks(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        type,
        content: '',
        x,
        y,
      },
    ]);
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(blocks => blocks.map(b => (b.id === id ? { ...b, content } : b)));
  };

  const updateBlockStyle = (id: string, style: Partial<Block>) => {
    setBlocks(blocks => blocks.map(b => (b.id === id ? { ...b, ...style } : b)));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="shrine-builder">
        <h2 className="shrine-builder__title">Shrine Builder</h2>
        <DropArea
          blocks={blocks}
          onDropBlock={onDropBlock}
          updateBlockContent={updateBlockContent}
          updateBlockStyle={updateBlockStyle}
        />
        <div className="shrine-builder__palette">
          {BLOCK_OPTIONS.map(opt => (
            <PaletteBlock key={opt.type} type={opt.type} label={opt.label} />
          ))}
        </div>
      </div>
    </DndProvider>
  );
};

export default ShrineBuilder;
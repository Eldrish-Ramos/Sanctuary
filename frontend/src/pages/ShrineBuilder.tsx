import React, { useState, FC, useRef } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './ShrineBuilder.scss';
import axios from 'axios';

function generateCode(length = 15) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; ++i) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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
  finalized?: boolean;
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
  onFinalize: (id: string) => void;
}> = ({ block, onChange, onStyleChange, onFinalize }) => {
  const ref = useRef<HTMLDivElement>(null);

  // Handle input and update content
  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    onChange(block.id, (e.target as HTMLDivElement).innerHTML);
  };

  // Handle paste to strip direction and unwanted styles
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  // Finalized (read-only) view
  if (block.finalized) {
    return (
      <div
        style={{
          fontFamily: block.fontFamily || 'serif',
          fontSize: block.fontSize || '1.1rem',
          color: block.color || '#7c2152',
          minHeight: 60,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    );
  }

  // Editable view
  return (
    <div className="shrine-builder__block">
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
        <button type="button" onClick={() => document.execCommand('bold')} title="Bold"><b>B</b></button>
        <button type="button" onClick={() => document.execCommand('italic')} title="Italic"><i>I</i></button>
        <button type="button" onClick={() => document.execCommand('underline')} title="Underline"><u>U</u></button>
        <button
          type="button"
          className="shrine-builder__finalize-btn"
          onClick={() => onFinalize(block.id)}
          title="Finalize"
        >
          Finalize
        </button>
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
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          outline: 'none',
        }}
        onInput={handleInput}
        onPaste={handlePaste}
        spellCheck={true}
        tabIndex={0}
        dangerouslySetInnerHTML={{ __html: block.content }}
      />
    </div>
  );
};

const ImageBlock: FC<{
  block: Block;
  onChange: (id: string, content: string) => void;
  onFinalize: (id: string) => void;
}> = ({ block, onChange, onFinalize }) => {
  if (block.finalized) {
    return (
      <div>
        {block.content && (
          <img
            src={block.content}
            alt=""
            style={{
              maxWidth: '100%',
              borderRadius: '1rem',
              display: 'block',
            }}
          />
        )}
      </div>
    );
  }
  return (
    <div className="shrine-builder__block">
      <input
        className="shrine-builder__input"
        placeholder="Paste image URL..."
        value={block.content}
        onChange={e => onChange(block.id, e.target.value)}
      />
      <button
        type="button"
        className="shrine-builder__finalize-btn"
        onClick={() => onFinalize(block.id)}
        title="Finalize"
      >
        Finalize
      </button>
      {block.content && (
        <img
          src={block.content}
          alt=""
          style={{
            maxWidth: '100%',
            borderRadius: '1rem',
            marginTop: '0.5rem',
            display: 'block',
          }}
        />
      )}
    </div>
  );
};

const AudioBlock: FC<{
  block: Block;
  onChange: (id: string, content: string) => void;
  onFinalize: (id: string) => void;
}> = ({ block, onChange, onFinalize }) => {
  if (block.finalized) {
    return (
      <div>
        {block.content && (
          <audio controls src={block.content} style={{ width: '100%' }} />
        )}
      </div>
    );
  }
  return (
    <div className="shrine-builder__block">
      <input
        className="shrine-builder__input"
        placeholder="Paste audio URL..."
        value={block.content}
        onChange={e => onChange(block.id, e.target.value)}
      />
      <button
        type="button"
        className="shrine-builder__finalize-btn"
        onClick={() => onFinalize(block.id)}
        title="Finalize"
      >
        Finalize
      </button>
      {block.content && (
        <audio controls src={block.content} style={{ width: '100%', marginTop: '0.5rem' }} />
      )}
    </div>
  );
};

const DropArea: FC<{
  blocks: Block[];
  onDropBlock: (type: BlockType, x: number, y: number) => void;
  updateBlockContent: (id: string, content: string) => void;
  updateBlockStyle: (id: string, style: Partial<Block>) => void;
  finalizeBlock: (id: string) => void;
}> = ({ blocks, onDropBlock, updateBlockContent, updateBlockStyle, finalizeBlock }) => {
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
          className={block.finalized ? '' : 'shrine-builder__block'}
          style={{
            position: 'absolute',
            left: block.x,
            top: block.y,
            minWidth: 180,
            minHeight: 40,
            background: block.finalized ? 'none' : undefined,
            boxShadow: block.finalized ? 'none' : undefined,
            border: block.finalized ? 'none' : undefined,
            padding: block.finalized ? 0 : undefined,
          }}
        >
          {block.type === 'text' && (
            <TextBlock
              block={block}
              onChange={updateBlockContent}
              onStyleChange={updateBlockStyle}
              onFinalize={finalizeBlock}
            />
          )}
          {block.type === 'image' && (
            <ImageBlock
              block={block}
              onChange={updateBlockContent}
              onFinalize={finalizeBlock}
            />
          )}
          {block.type === 'audio' && (
            <AudioBlock
              block={block}
              onChange={updateBlockContent}
              onFinalize={finalizeBlock}
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
  const [shareStatus, setShareStatus] = useState<string | null>(null);

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

  const finalizeBlock = (id: string) => {
    setBlocks(blocks => blocks.map(b => (b.id === id ? { ...b, finalized: true } : b)));
  };

  const handleShare = async () => {
    const code = generateCode();
    try {
      await axios.post('/api/shrines', {
        code,
        content: blocks,
      });
      setShareStatus(`Your shrine has been shared! Code: ${code}`);
    } catch (err) {
      setShareStatus('Failed to share shrine. Please try again.');
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div contentEditable style={{ minHeight: 60 }} />
      <div className="shrine-builder">
        <h2 className="shrine-builder__title">Shrine Builder</h2>
        <DropArea
          blocks={blocks}
          onDropBlock={onDropBlock}
          updateBlockContent={updateBlockContent}
          updateBlockStyle={updateBlockStyle}
          finalizeBlock={finalizeBlock}
        />
        <div className="shrine-builder__palette">
          {BLOCK_OPTIONS.map(opt => (
            <PaletteBlock key={opt.type} type={opt.type} label={opt.label} />
          ))}
        </div>
        <button
          className="shrine-builder__share-btn"
          onClick={handleShare}
          disabled={blocks.length === 0}
        >
          Share
        </button>
        {shareStatus && <div className="shrine-builder__share-status">{shareStatus}</div>}
      </div>
    </DndProvider>
  );
};

export default ShrineBuilder;
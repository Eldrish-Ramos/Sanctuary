import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ShrineBuilder.scss'; // For block styling

interface Shrine {
  _id: string;
  title: string;
  code: string;
  content: any;
}

const renderBlock = (block: any) => (
  <div
    key={block.id}
    className="shrine-builder__block"
    style={{
      position: 'static',
      margin: '1.5rem 0',
      maxWidth: 340,
      minWidth: 220,
      boxSizing: 'border-box',
    }}
  >
    {block.type === 'text' && (
    <div
        style={{
        fontFamily: block.fontFamily || 'serif',
        fontSize: block.fontSize || '1.1rem',
        color: block.color || '#7c2152',
        minHeight: 60,
        // direction: 'ltr', // REMOVE THIS LINE
        }}
        dangerouslySetInnerHTML={{ __html: block.content }}
    />
    )}
    {block.type === 'image' && (
      <img
        src={block.content}
        alt=""
        style={{
          maxWidth: '100%',
          borderRadius: '1rem',
          display: 'block',
          margin: '0.5rem auto',
        }}
      />
    )}
    {block.type === 'audio' && (
      <audio controls src={block.content} style={{ width: '100%', marginTop: '0.5rem' }} />
    )}
  </div>
);

const ExplorePage = () => {
  const [shrine, setShrine] = useState<Shrine | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRandomShrine = () => {
    setLoading(true);
    setError(null);
    axios.get('/api/shrines/random')
      .then(res => setShrine(res.data))
      .catch(() => setError('No shrines found.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRandomShrine();
    // eslint-disable-next-line
  }, []);

  if (error) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>{error}</div>;
  if (loading || !shrine) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading...</div>;

  // Remove code from title if present (avoid duplicate code display)
  let displayTitle = shrine.title;
  if (displayTitle && displayTitle.endsWith(shrine.code)) {
    displayTitle = displayTitle.replace(shrine.code, '').replace(/Shrine\s*$/, '').trim();
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', background: '#fff', borderRadius: '1.5rem', boxShadow: '0 4px 24px rgba(190,24,93,0.10)', padding: '2rem' }}>
      <h2 style={{ color: '#be185d', fontFamily: 'Caveat, cursive, serif', fontSize: '2rem', textAlign: 'center', marginBottom: '0.5rem' }}>
        {displayTitle || 'Shrine'}
      </h2>
      <div style={{ textAlign: 'center', color: '#7c2152', fontSize: '1rem', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
        Shrine Code: <span style={{ letterSpacing: '0.08em' }}>{shrine.code}</span>
      </div>
      {Array.isArray(shrine.content) && shrine.content.map(renderBlock)}
      <button
        onClick={fetchRandomShrine}
        style={{
          margin: '2rem auto 0 auto',
          display: 'block',
          background: 'linear-gradient(90deg, #be185d 60%, #e11d48 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '0.7rem',
          padding: '1rem 2.5rem',
          fontSize: '1.2rem',
          fontFamily: 'Caveat, cursive, serif',
          fontWeight: 700,
          letterSpacing: '0.04em',
          boxShadow: '0 2px 12px rgba(190, 24, 93, 0.08)',
          cursor: 'pointer',
          transition: 'background 0.2s, color 0.2s',
        }}
        disabled={loading}
      >
        Next Shrine
      </button>
    </div>
  );
};

export default ExplorePage;
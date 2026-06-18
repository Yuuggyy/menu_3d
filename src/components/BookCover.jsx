import { useState } from 'react';

export default function BookCover({ restaurantName, onOpen, lang }) {
  const [opening, setOpening] = useState(false);
  const [opened, setOpened] = useState(false);

  const handleOpen = () => {
    if (opening || opened) return;
    setOpening(true);
    setTimeout(() => {
      setOpened(true);
      onOpen();
    }, 1200);
  };

  const L = lang === 'en'
    ? { cta: 'Open Menu', subtitle: 'Discover our creations' }
    : { cta: 'Ouvrir le menu', subtitle: 'Découvrez nos créations' };

  if (opened) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #2a1505 0%, #0d0500 65%)',
      perspective: '1200px',
    }}>
      <style>{`
        @keyframes coverOpen {
          0%   { transform: rotateY(0deg);    }
          100% { transform: rotateY(-150deg); }
        }
        @keyframes coverGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(201,168,76,0.3), 0 25px 60px rgba(0,0,0,0.8); }
          50%       { box-shadow: 0 0 60px rgba(201,168,76,0.6), 0 25px 60px rgba(0,0,0,0.8); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes floatIn {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ornamentSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .cover-book {
          transform-origin: left center;
          transform-style: preserve-3d;
          animation: coverGlow 3s ease-in-out infinite;
          cursor: pointer;
          transition: transform 0.3s ease;
        }
        .cover-book.opening {
          animation: coverOpen 1.2s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards !important;
        }
        .cover-book:not(.opening):hover {
          transform: rotateY(-8deg) translateX(8px);
        }
        .shimmer-text {
          background: linear-gradient(90deg, #c9a84c 0%, #e8d08a 40%, #fff8e1 50%, #e8d08a 60%, #c9a84c 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      {/* Livre - couverture */}
      <div
        className={`cover-book${opening ? ' opening' : ''}`}
        onClick={handleOpen}
        style={{
          width: 280, height: 380,
          position: 'relative',
          borderRadius: '4px 16px 16px 4px',
          background: 'linear-gradient(135deg, #1a0800 0%, #2d1200 40%, #1a0800 100%)',
          border: '2px solid rgba(201,168,76,0.5)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8), inset 4px 0 12px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '32px 24px',
          gap: 16,
          userSelect: 'none',
        }}
      >
        {/* Reliure gauche */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 18,
          background: 'linear-gradient(to right, #0d0500, #2a1505)',
          borderRadius: '4px 0 0 4px',
          borderRight: '1px solid rgba(201,168,76,0.3)',
        }} />

        {/* Ornement haut */}
        <div style={{
          position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)',
          width: 180, height: 1,
          background: 'linear-gradient(to right, transparent, #c9a84c, transparent)',
        }} />
        <div style={{
          position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
          fontSize: 14, color: '#c9a84c', letterSpacing: 6, whiteSpace: 'nowrap',
        }}>✦ ✦ ✦</div>

        {/* Logo / Emblème central */}
        <div style={{
          width: 80, height: 80,
          border: '2px solid rgba(201,168,76,0.6)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)',
          marginBottom: 8,
          position: 'relative',
        }}>
          <span style={{ fontSize: 36 }}>🍽️</span>
          {/* Cercle décoratif */}
          <div style={{
            position: 'absolute', inset: -8,
            border: '1px solid rgba(201,168,76,0.25)',
            borderRadius: '50%',
          }} />
        </div>

        {/* Nom du restaurant */}
        <h1 className="shimmer-text" style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 22, fontWeight: 900,
          textAlign: 'center', lineHeight: 1.3,
          letterSpacing: '1px',
        }}>
          {restaurantName || 'Notre Menu'}
        </h1>

        {/* Ligne décorative */}
        <div style={{
          width: 120, height: 1,
          background: 'linear-gradient(to right, transparent, #c9a84c, transparent)',
        }} />

        {/* Sous-titre */}
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 11, color: 'rgba(201,168,76,0.65)',
          textAlign: 'center', letterSpacing: '2px',
          textTransform: 'uppercase', fontStyle: 'italic',
        }}>{L.subtitle}</p>

        {/* Ornement bas */}
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          width: 180, height: 1,
          background: 'linear-gradient(to right, transparent, #c9a84c, transparent)',
        }} />
        <div style={{
          position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
          fontSize: 14, color: '#c9a84c', letterSpacing: 6, whiteSpace: 'nowrap',
        }}>✦ ✦ ✦</div>

        {/* CTA */}
        <div style={{
          position: 'absolute', bottom: 38, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(201,168,76,0.1)',
          border: '1px solid rgba(201,168,76,0.4)',
          borderRadius: 20, padding: '6px 20px',
          fontSize: 10, color: '#c9a84c', letterSpacing: '1.5px',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
          animation: 'floatIn 1s ease forwards',
        }}>{L.cta} →</div>
      </div>

      {/* Pages visibles sur la tranche droite (effet épaisseur livre) */}
      <div style={{
        position: 'absolute',
        width: 12, height: 376,
        background: 'repeating-linear-gradient(to bottom, #f5efe0 0px, #f5efe0 2px, #e0d4ba 2px, #e0d4ba 4px)',
        left: 'calc(50% + 140px)',
        borderRadius: '0 2px 2px 0',
        boxShadow: '3px 0 8px rgba(0,0,0,0.4)',
        transform: 'translateY(-8px)',
      }} />
    </div>
  );
}

import { useState, useEffect } from 'react';

/*
  BookCover — s'affiche EN OVERLAY par-dessus le menu déjà chargé.
  Quand l'utilisateur clique, la couverture pivote et disparaît,
  révélant le menu exactement à sa place. Aucun re-layout.
*/
export default function BookCover({ restaurantName, onOpen, lang, visible }) {
  const [phase, setPhase] = useState('idle'); // idle | opening | gone

  const handleOpen = () => {
    if (phase !== 'idle') return;
    setPhase('opening');
    setTimeout(() => {
      setPhase('gone');
      onOpen();
    }, 900);
  };

  if (!visible && phase !== 'opening') return null;
  if (phase === 'gone') return null;

  const L = lang === 'en'
    ? { cta: 'Open Menu', subtitle: 'Discover our creations' }
    : { cta: 'Ouvrir le menu', subtitle: 'Découvrez nos créations' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 30%, #2a1505 0%, #0d0500 70%)',
      perspective: '1400px',
    }}>
      <style>{`
        @keyframes coverReveal {
          0%   { transform: rotateY(0deg) translateZ(0); opacity: 1; }
          60%  { transform: rotateY(-95deg) translateZ(20px); opacity: 1; }
          100% { transform: rotateY(-110deg) translateZ(10px); opacity: 0; }
        }
        @keyframes goldShimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes coverPulse {
          0%,100% { box-shadow: 0 0 25px rgba(201,168,76,0.2), 0 30px 70px rgba(0,0,0,0.85); }
          50%      { box-shadow: 0 0 55px rgba(201,168,76,0.45), 0 30px 70px rgba(0,0,0,0.85); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .cover-wrap {
          transform-origin: left center;
          transform-style: preserve-3d;
          animation: coverPulse 3.5s ease-in-out infinite;
          cursor: pointer;
          transition: filter 0.2s;
        }
        .cover-wrap:hover { filter: brightness(1.12); }
        .cover-wrap.opening {
          animation: coverReveal 0.9s cubic-bezier(0.77,0,0.18,1) forwards !important;
        }
        .gold-shimmer {
          background: linear-gradient(90deg,
            #a07830 0%, #c9a84c 30%, #f0d882 50%, #c9a84c 70%, #a07830 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: goldShimmer 4s linear infinite;
        }
        .cta-pulse {
          animation: fadeUp 0.8s ease 0.6s both;
        }
      `}</style>

      <div
        className={'cover-wrap' + (phase === 'opening' ? ' opening' : '')}
        onClick={handleOpen}
        style={{
          width: 'min(72vw, 300px)',
          height: 'min(68vh, 440px)',
          position: 'relative',
          borderRadius: '6px 18px 18px 6px',
          background: 'linear-gradient(160deg, #1f0c02 0%, #2e1400 45%, #1a0800 100%)',
          border: '1.5px solid rgba(201,168,76,0.45)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '10% 8%',
          gap: 'min(3vh, 14px)',
          userSelect: 'none',
          overflow: 'hidden',
        }}
      >
        {/* Reliure gauche */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 20,
          background: 'linear-gradient(to right, #080300, #1c0a00, #100600)',
          borderRadius: '6px 0 0 6px',
          borderRight: '1px solid rgba(201,168,76,0.25)',
        }} />

        {/* Filet haut */}
        <div style={{ position: 'absolute', top: 18, left: 28, right: 16,
          height: 1, background: 'linear-gradient(to right, rgba(201,168,76,0.6), rgba(201,168,76,0.15))' }} />
        <div style={{ position: 'absolute', top: 24, left: 28, right: 16,
          height: 1, background: 'linear-gradient(to right, rgba(201,168,76,0.25), transparent)' }} />

        {/* Emblème */}
        <div style={{
          width: 'min(18vw, 74px)', height: 'min(18vw, 74px)',
          border: '1.5px solid rgba(201,168,76,0.5)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)',
          position: 'relative', flexShrink: 0,
        }}>
          <span style={{ fontSize: 'min(9vw, 34px)' }}>🍽️</span>
          <div style={{
            position: 'absolute', inset: -7,
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: '50%',
          }} />
        </div>

        {/* Titre */}
        <h1 className="gold-shimmer" style={{
          fontFamily: "'Cormorant Garamond','Playfair Display',serif",
          fontSize: 'min(6vw, 22px)', fontWeight: 700,
          textAlign: 'center', lineHeight: 1.25,
          letterSpacing: '1.5px', margin: 0,
        }}>{restaurantName || 'Notre Menu'}</h1>

        {/* Filet décoratif */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '70%' }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.5))' }} />
          <span style={{ color: 'rgba(201,168,76,0.6)', fontSize: 10 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.5))' }} />
        </div>

        {/* Sous-titre */}
        <p style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: 'min(3.2vw, 11px)', color: 'rgba(201,168,76,0.55)',
          textAlign: 'center', letterSpacing: '2.5px',
          textTransform: 'uppercase', fontStyle: 'italic', margin: 0,
        }}>{L.subtitle}</p>

        {/* CTA */}
        <div className="cta-pulse" style={{
          position: 'absolute', bottom: '8%',
          border: '1px solid rgba(201,168,76,0.35)',
          borderRadius: 20, padding: 'min(1.5vh,6px) min(4vw,18px)',
          fontSize: 'min(3vw, 10px)', color: 'rgba(201,168,76,0.75)',
          letterSpacing: '2px', textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          background: 'rgba(201,168,76,0.06)',
        }}>{L.cta} →</div>

        {/* Filet bas */}
        <div style={{ position: 'absolute', bottom: 22, left: 28, right: 16,
          height: 1, background: 'linear-gradient(to right, rgba(201,168,76,0.35), transparent)' }} />

        {/* Tranche pages (effet épaisseur) */}
        <div style={{
          position: 'absolute', right: -9, top: 3, bottom: 3, width: 9,
          background: 'repeating-linear-gradient(to bottom,#f5efe0 0,#f5efe0 2px,#d8ccb0 2px,#d8ccb0 4px)',
          borderRadius: '0 2px 2px 0',
          boxShadow: '4px 0 10px rgba(0,0,0,0.4)',
        }} />
      </div>
    </div>
  );
}

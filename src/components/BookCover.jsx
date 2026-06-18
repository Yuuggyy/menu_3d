import { useState } from 'react';

export default function BookCover({ restaurantName, onOpen, lang, visible }) {
  const [phase, setPhase] = useState('idle');

  if (!visible && phase !== 'opening') return null;
  if (phase === 'gone') return null;

  const handleOpen = () => {
    if (phase !== 'idle') return;
    setPhase('opening');
    setTimeout(() => { setPhase('gone'); onOpen(); }, 950);
  };

  const L = lang === 'en'
    ? { cta: 'Open Menu', subtitle: 'Resto · Bar · Experiences' }
    : { cta: 'Ouvrir le menu', subtitle: 'Resto · Bar · Expériences' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at 50% 25%, #1C1208 0%, #0F0F0E 70%)',
      perspective: '1400px',
    }}>
      <style>{`
        @keyframes malamuCoverOpen {
          0%   { transform: rotateY(0deg); opacity: 1; }
          55%  { transform: rotateY(-92deg) translateZ(24px); opacity: 1; }
          100% { transform: rotateY(-115deg) translateZ(10px); opacity: 0; }
        }
        @keyframes terraPulse {
          0%,100% { box-shadow: 0 0 28px rgba(196,98,45,0.25), 0 32px 72px rgba(0,0,0,0.9); }
          50%      { box-shadow: 0 0 52px rgba(196,98,45,0.5), 0 32px 72px rgba(0,0,0,0.9); }
        }
        @keyframes shimmerTerra {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes fadeCta {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .malamu-cover {
          transform-origin: left center;
          transform-style: preserve-3d;
          animation: terraPulse 3.5s ease-in-out infinite;
          cursor: pointer;
          transition: filter 0.25s;
        }
        .malamu-cover:hover { filter: brightness(1.1); }
        .malamu-cover.opening {
          animation: malamuCoverOpen 0.95s cubic-bezier(0.77,0,0.18,1) forwards !important;
        }
        .malamu-shimmer {
          background: linear-gradient(90deg,
            #C4622D 0%, #E8936A 35%, #FAE0D0 50%, #E8936A 65%, #C4622D 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerTerra 4s linear infinite;
        }
        .malamu-cta { animation: fadeCta 0.9s ease 0.5s both; }
      `}</style>

      <div
        className={'malamu-cover' + (phase === 'opening' ? ' opening' : '')}
        onClick={handleOpen}
        style={{
          width: 'min(74vw, 290px)',
          height: 'min(70vh, 430px)',
          position: 'relative',
          borderRadius: '8px 20px 20px 8px',
          /* Fond texture sombre + tropical */
          background: 'linear-gradient(155deg, #1C1208 0%, #2A1A0A 40%, #1A1108 100%)',
          border: '1.5px solid rgba(196,98,45,0.5)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '12% 9%',
          gap: 'min(2.8vh, 13px)',
          userSelect: 'none', overflow: 'hidden',
        }}
      >
        {/* Motif tropical subtil en fond */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5 C20 15 10 20 5 30 C10 40 20 45 30 55 C40 45 50 40 55 30 C50 20 40 15 30 5Z' fill='%23C4622D'/%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px',
        }} />

        {/* Reliure gauche */}
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 22,
          background: 'linear-gradient(to right,#080604,#1C1208,#0E0A06)',
          borderRadius: '8px 0 0 8px',
          borderRight: '1px solid rgba(196,98,45,0.3)',
        }} />

        {/* Filet haut terra */}
        <div style={{
          position: 'absolute', top: 18, left: 30, right: 14,
          height: 1, background: 'linear-gradient(to right,rgba(196,98,45,0.7),rgba(196,98,45,0.1))',
        }} />

        {/* Logo cercle Malamu — style leur PP Instagram */}
        <div style={{
          width: 'min(20vw, 80px)', height: 'min(20vw, 80px)',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #C4622D 0%, #8B3A18 50%, #C4622D 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(196,98,45,0.4)',
          flexShrink: 0, position: 'relative',
        }}>
          {/* Texte script Malamu comme leur logo */}
          <span style={{
            fontFamily: "'Cormorant Garamond',Georgia,serif",
            fontSize: 'min(5.5vw, 22px)', fontWeight: 400,
            color: '#FAF0E0', fontStyle: 'italic',
            letterSpacing: '-0.5px',
          }}>Malamu</span>
          <div style={{
            position: 'absolute', inset: -8,
            border: '1px solid rgba(196,98,45,0.3)',
            borderRadius: '50%',
          }} />
        </div>

        {/* Nom */}
        <h1 className="malamu-shimmer" style={{
          fontFamily: "'Cormorant Garamond','Playfair Display',serif",
          fontSize: 'min(7vw, 26px)', fontWeight: 600,
          textAlign: 'center', lineHeight: 1.2,
          letterSpacing: '3px', margin: 0, textTransform: 'uppercase',
        }}>MALAMU</h1>

        {/* Filet déco */}
        <div style={{ display:'flex', alignItems:'center', gap:8, width:'72%' }}>
          <div style={{ flex:1, height:1, background:'linear-gradient(to right,transparent,rgba(196,98,45,0.55))' }} />
          <span style={{ color:'rgba(196,98,45,0.7)', fontSize:9 }}>✦</span>
          <div style={{ flex:1, height:1, background:'linear-gradient(to left,transparent,rgba(196,98,45,0.55))' }} />
        </div>

        {/* Sous-titre */}
        <p style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: 'min(3.5vw, 11px)', color: 'rgba(232,147,106,0.65)',
          textAlign: 'center', letterSpacing: '2.5px',
          textTransform: 'uppercase', fontStyle: 'italic', margin: 0,
        }}>{L.subtitle}</p>

        {/* CTA */}
        <div className="malamu-cta" style={{
          position: 'absolute', bottom: '7%',
          border: '1px solid rgba(196,98,45,0.4)',
          borderRadius: 20, padding: 'min(1.5vh,6px) min(5vw,20px)',
          fontSize: 'min(3.2vw, 10px)', color: 'rgba(232,147,106,0.8)',
          letterSpacing: '2px', textTransform: 'uppercase', whiteSpace: 'nowrap',
          background: 'rgba(196,98,45,0.08)',
        }}>{L.cta} →</div>

        {/* Filet bas */}
        <div style={{
          position: 'absolute', bottom: 22, left: 30, right: 14,
          height: 1, background: 'linear-gradient(to right,rgba(196,98,45,0.4),transparent)',
        }} />

        {/* Tranche pages */}
        <div style={{
          position: 'absolute', right: -9, top: 4, bottom: 4, width: 9,
          background: 'repeating-linear-gradient(to bottom,#F5EFE0 0,#F5EFE0 2px,#D9CEBC 2px,#D9CEBC 4px)',
          borderRadius: '0 2px 2px 0',
          boxShadow: '4px 0 10px rgba(0,0,0,0.5)',
        }} />
      </div>
    </div>
  );
}

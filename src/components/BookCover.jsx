import { useState } from 'react';

export default function BookCover({ onOpen, lang, visible }) {
  const [phase, setPhase] = useState('idle');
  if (!visible && phase !== 'opening') return null;
  if (phase === 'gone') return null;

  const handleOpen = () => {
    if (phase !== 'idle') return;
    setPhase('opening');
    setTimeout(() => { setPhase('gone'); onOpen(); }, 900);
  };

  const L = lang === 'en'
    ? { cta: 'Open Menu' }
    : { cta: 'Ouvrir le menu' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0F0F0E',
      perspective: '1400px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&display=swap');

        @keyframes cover-open {
          0%   { transform: rotateY(0deg); opacity: 1; }
          60%  { transform: rotateY(-95deg) translateZ(20px); opacity: 1; }
          100% { transform: rotateY(-120deg) translateZ(8px); opacity: 0; }
        }
        @keyframes cover-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes cover-shimmer {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes cover-cta-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .malamu-cover-wrap {
          transform-origin: left center;
          animation: cover-float 4s ease-in-out infinite;
          cursor: pointer;
          filter: drop-shadow(0 30px 60px rgba(0,0,0,0.8));
          transition: filter 0.3s;
        }
        .malamu-cover-wrap:hover {
          filter: drop-shadow(0 35px 70px rgba(196,98,45,0.3)) drop-shadow(0 30px 60px rgba(0,0,0,0.8));
        }
        .malamu-cover-wrap.opening {
          animation: cover-open 0.9s cubic-bezier(0.77,0,0.18,1) forwards !important;
        }

        .cover-title-shimmer {
          background: linear-gradient(90deg, #C4622D 0%, #E8936A 30%, #FAE0D0 50%, #E8936A 70%, #C4622D 100%);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: cover-shimmer 4.5s linear infinite;
        }

        .cover-cta {
          animation: cover-cta-in 0.8s ease 0.7s both;
        }
      `}</style>

      <div
        className={'malamu-cover-wrap' + (phase === 'opening' ? ' opening' : '')}
        onClick={handleOpen}
        style={{
          width:  'min(72vw, 280px)',
          height: 'min(68vh, 420px)',
          position: 'relative',
          borderRadius: '6px 18px 18px 6px',
          background: 'linear-gradient(160deg, #1C1208 0%, #2A1A0A 45%, #160E05 100%)',
          border: '1px solid rgba(196,98,45,0.45)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '10% 8%', gap: 'min(2vh, 10px)',
          userSelect: 'none', overflow: 'hidden',
        }}>

        {/* Texture diagonale subtile */}
        <div style={{
          position:'absolute', inset:0, pointerEvents:'none',
          backgroundImage:`repeating-linear-gradient(
            45deg,
            transparent,
            transparent 18px,
            rgba(196,98,45,0.015) 18px,
            rgba(196,98,45,0.015) 19px
          )`,
        }} />

        {/* Reliure gauche */}
        <div style={{
          position:'absolute', left:0, top:0, bottom:0, width:20,
          background:'linear-gradient(to right,#060403,#1A1005,#0A0703)',
          borderRadius:'6px 0 0 6px',
          borderRight:'1px solid rgba(196,98,45,0.2)',
        }} />

        {/* Trait haut */}
        <div style={{
          position:'absolute', top:16, left:28, right:12, height:1,
          background:'linear-gradient(to right,rgba(196,98,45,0.6),rgba(196,98,45,0.05))',
        }} />

        {/* Cercle logo Malamu */}
        <div style={{
          width: 'min(19vw, 74px)', height: 'min(19vw, 74px)',
          borderRadius:'50%',
          background:'radial-gradient(circle at 40% 35%, #D4724A 0%, #8B3A18 55%, #C4622D 100%)',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 0 28px rgba(196,98,45,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
          flexShrink:0, position:'relative',
        }}>
          <span style={{
            fontFamily:"'Cormorant Garamond',Georgia,serif",
            fontSize:'min(5vw, 20px)', fontWeight:400, fontStyle:'italic',
            color:'rgba(250,240,224,0.95)',
            letterSpacing:'-0.3px',
          }}>Malamu</span>
          <div style={{
            position:'absolute', inset:-9,
            border:'1px solid rgba(196,98,45,0.25)',
            borderRadius:'50%',
          }} />
        </div>

        {/* Titre principal */}
        <h1 className="cover-title-shimmer" style={{
          fontFamily:"'Cormorant Garamond','Playfair Display',serif",
          fontSize:'min(8vw, 30px)', fontWeight:600,
          letterSpacing:'4px', textTransform:'uppercase',
          margin:0, textAlign:'center', lineHeight:1,
        }}>MALAMU</h1>

        {/* Filet central */}
        <div style={{ display:'flex', alignItems:'center', gap:7, width:'68%' }}>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to right,transparent,rgba(196,98,45,0.45))' }} />
          <span style={{ color:'rgba(196,98,45,0.55)', fontSize:8, letterSpacing:2 }}>✦</span>
          <div style={{ flex:1, height:'1px', background:'linear-gradient(to left,transparent,rgba(196,98,45,0.45))' }} />
        </div>

        {/* Sous-titre */}
        <p style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:'min(3.2vw, 10px)', fontStyle:'italic',
          color:'rgba(232,147,106,0.55)', letterSpacing:'2.5px',
          textTransform:'uppercase', margin:0, textAlign:'center',
        }}>Resto · Bar · Expériences</p>

        {/* CTA */}
        <div className="cover-cta" style={{
          position:'absolute', bottom:'8%',
          padding:'5px 18px',
          border:'1px solid rgba(196,98,45,0.35)',
          borderRadius:20,
          fontSize:'min(3vw, 9.5px)', letterSpacing:'2px',
          color:'rgba(232,147,106,0.7)',
          textTransform:'uppercase',
          background:'rgba(196,98,45,0.07)',
          whiteSpace:'nowrap',
        }}>{L.cta} →</div>

        {/* Trait bas */}
        <div style={{
          position:'absolute', bottom:20, left:28, right:12, height:1,
          background:'linear-gradient(to right,rgba(196,98,45,0.35),transparent)',
        }} />

        {/* Tranche pages */}
        <div style={{
          position:'absolute', right:-8, top:3, bottom:3, width:8,
          background:'repeating-linear-gradient(to bottom,#F5EFE0 0,#F5EFE0 2px,#D9CEBC 2px,#D9CEBC 4px)',
          borderRadius:'0 2px 2px 0',
          boxShadow:'3px 0 8px rgba(0,0,0,0.4)',
        }} />

        {/* Ombre latérale couverture */}
        <div style={{
          position:'absolute', right:0, top:0, bottom:0, width:18,
          background:'linear-gradient(to left,rgba(0,0,0,0.4),transparent)',
          pointerEvents:'none',
        }} />
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';

export default function BookCover({ onOpen, lang, visible }) {
  const [phase, setPhase] = useState('idle');

  useEffect(() => {
    if (!visible && phase === 'idle') return;
    if (!visible && phase !== 'opening') setPhase('gone');
  }, [visible]);

  if (phase === 'gone' || (!visible && phase === 'idle')) return null;

  const handleOpen = () => {
    if (phase !== 'idle') return;
    setPhase('opening');
    setTimeout(() => { setPhase('gone'); onOpen(); }, 880);
  };

  const L = lang === 'en' ? { cta: 'Open Menu' } : { cta: 'Ouvrir le menu' };

  return (
    <div className="cover-scene">
      <div
        className={`cover-book${phase === 'opening' ? ' is-opening' : ''}`}
        onClick={handleOpen}
      >
        <div className="cover-front">
          <div className="cover-texture" />
          <div className="cover-spine" />
          <div className="cover-pages" />
          <div className="cover-line-top" />
          <div className="cover-line-bot" />

          {/* Logo cercle */}
          <div className="cover-logo-circle">
            <div className="cover-logo-ring" />
            <span className="cover-logo-text">Malamu</span>
          </div>

          {/* Titre */}
          <h1 className="cover-title">MALAMU</h1>

          {/* Filet */}
          <div className="cover-divider">
            <div className="cover-divider-line l" />
            <span className="cover-diamond">✦</span>
            <div className="cover-divider-line r" />
          </div>

          {/* Sous-titre */}
          <p className="cover-sub">Resto · Bar · Expériences</p>

          {/* CTA */}
          <div className="cover-cta">{L.cta} →</div>
        </div>
      </div>
    </div>
  );
}

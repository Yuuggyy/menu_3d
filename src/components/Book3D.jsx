import { useState, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────
   Carte produit — mobile-first
───────────────────────────────────────── */
function ProduitCard({ produit, onAdd, lang, isMobile }) {
  const [qty, setQty] = useState(0);
  const L = lang === 'en' ? { add: 'Order' } : { add: 'Ajouter' };

  const handleAdd = () => {
    if (qty === 0) return;
    onAdd({ ...produit, prix_unit: produit.prix, quantite: qty });
    setQty(0);
  };

  return (
    <div style={{
      display: 'flex', gap: isMobile ? 8 : 10,
      padding: isMobile ? '8px 0' : '10px 0',
      borderBottom: '1px solid rgba(90,58,26,0.22)',
      alignItems: 'center',
    }}>
      {/* Image */}
      <div style={{
        width: isMobile ? 46 : 56, height: isMobile ? 46 : 56,
        borderRadius: 8, overflow: 'hidden', flexShrink: 0,
        background: 'rgba(90,58,26,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {produit.image_url
          ? <img src={produit.image_url} alt={produit.nom}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: isMobile ? 18 : 22 }}>🍽️</span>}
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: isMobile ? 12 : 13, fontWeight: 700, color: '#1a0a00',
          lineHeight: 1.3, marginBottom: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{produit.nom}</p>
        {produit.description && !isMobile && (
          <p style={{ fontSize: 10, color: '#7a5a3a', lineHeight: 1.3, marginBottom: 2 }}>
            {produit.description.length > 45 ? produit.description.slice(0, 45) + '…' : produit.description}
          </p>
        )}
        <p style={{ fontSize: isMobile ? 13 : 14, fontWeight: 800, color: '#8B4513' }}>
          {Number(produit.prix).toFixed(2)}<span style={{ fontSize: 9, fontWeight: 500 }}> €</span>
        </p>
      </div>

      {/* Qty + Ajouter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 5 }}>
          <button onClick={() => setQty(q => Math.max(0, q - 1))} style={{
            width: isMobile ? 24 : 22, height: isMobile ? 24 : 22,
            borderRadius: '50%', border: '1.5px solid #8B4513',
            background: 'transparent', color: '#8B4513',
            fontSize: isMobile ? 15 : 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'manipulation',
          }}>−</button>
          <span style={{
            fontSize: isMobile ? 13 : 12, fontWeight: 700, color: '#1a0a00',
            minWidth: isMobile ? 18 : 14, textAlign: 'center',
          }}>{qty}</span>
          <button onClick={() => setQty(q => q + 1)} style={{
            width: isMobile ? 24 : 22, height: isMobile ? 24 : 22,
            borderRadius: '50%', border: 'none',
            background: '#8B4513', color: 'white',
            fontSize: isMobile ? 15 : 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'manipulation',
          }}>+</button>
        </div>
        {qty > 0 && (
          <button onClick={handleAdd} style={{
            background: 'linear-gradient(135deg,#8B4513,#c0622a)', color: 'white',
            border: 'none', borderRadius: 5,
            padding: isMobile ? '4px 8px' : '3px 7px',
            fontSize: isMobile ? 10 : 9, fontWeight: 700,
            cursor: 'pointer', whiteSpace: 'nowrap', touchAction: 'manipulation',
          }}>✓ {L.add}</button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Contenu d'une face de page
───────────────────────────────────────── */
function PageContent({ produits, categorie, pageNum, totalPages, onAdd, lang, side, isMobile }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: side === 'left'
        ? 'linear-gradient(to left, #e8dcc8, #f5efe0)'
        : 'linear-gradient(to right, #e8dcc8, #f5efe0)',
      padding: isMobile ? '12px 10px 8px' : '18px 14px 10px',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      boxShadow: side === 'left'
        ? 'inset -5px 0 15px rgba(0,0,0,0.1)'
        : 'inset 5px 0 15px rgba(0,0,0,0.1)',
    }}>
      {/* Lignes cahier */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 24px, rgba(90,58,26,0.06) 24px, rgba(90,58,26,0.06) 25px)',
        backgroundPositionY: '44px',
      }} />

      {/* En-tête catégorie */}
      {categorie && (
        <div style={{
          borderBottom: '2px solid rgba(139,69,19,0.2)',
          marginBottom: isMobile ? 6 : 10,
          paddingBottom: isMobile ? 5 : 7,
          display: 'flex', alignItems: 'center', gap: 5,
          position: 'relative',
        }}>
          <span style={{ fontSize: isMobile ? 14 : 16 }}>{categorie.emoji || '🍽️'}</span>
          <span style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: isMobile ? 13 : 15, fontWeight: 700, color: '#8B4513',
          }}>{categorie.nom}</span>
        </div>
      )}

      {/* Produits */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {produits.map(p => (
          <ProduitCard key={p.id} produit={p} onAdd={onAdd} lang={lang} isMobile={isMobile} />
        ))}
      </div>

      {/* Numéro de page */}
      <p style={{
        textAlign: side === 'left' ? 'left' : 'right',
        fontSize: 9, color: 'rgba(90,58,26,0.35)',
        fontStyle: 'italic', marginTop: 4,
        fontFamily: "'Playfair Display',serif",
        position: 'relative',
      }}>{pageNum} / {totalPages}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page animée (tourne 180°)
───────────────────────────────────────── */
function FlippingPage({ flipping, flipDir, fromPage, toPage, onAdd, lang, totalPages, spreadIndex, isMobile }) {
  if (!flipping) return null;

  const isNext    = flipDir === 'next';
  const origin    = isNext ? 'left center' : 'right center';
  const endAngle  = isNext ? -180 : 180;

  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0,
      left:  isNext ? '50%' : 0,
      right: isNext ? 0    : '50%',
      transformOrigin: origin,
      transformStyle: 'preserve-3d',
      animation: `pageFlip 0.65s cubic-bezier(0.645,0.045,0.355,1.000) forwards`,
      zIndex: 20,
      '--end-angle': `${endAngle}deg`,
    }}>
      <style>{`
        @keyframes pageFlip {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(var(--end-angle)); }
        }
      `}</style>

      {/* Face avant */}
      <div style={{
        position: 'absolute', inset: 0,
        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
        overflow: 'hidden',
      }}>
        {fromPage
          ? <PageContent produits={fromPage.produits} categorie={fromPage.categorie}
              pageNum={isNext ? spreadIndex * 2 + 2 : spreadIndex * 2 + 1}
              totalPages={totalPages} onAdd={onAdd} lang={lang}
              side={isNext ? 'right' : 'left'} isMobile={isMobile} />
          : <div style={{ width: '100%', height: '100%', background: '#f5efe0' }} />
        }
      </div>

      {/* Face arrière (miroir) */}
      <div style={{
        position: 'absolute', inset: 0,
        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg) scaleX(-1)',
        overflow: 'hidden',
        boxShadow: isNext ? 'inset -10px 0 25px rgba(0,0,0,0.18)' : 'inset 10px 0 25px rgba(0,0,0,0.18)',
      }}>
        {toPage
          ? <PageContent produits={toPage.produits} categorie={toPage.categorie}
              pageNum={isNext ? spreadIndex * 2 + 3 : spreadIndex * 2}
              totalPages={totalPages} onAdd={onAdd} lang={lang}
              side={isNext ? 'left' : 'right'} isMobile={isMobile} />
          : <div style={{ width: '100%', height: '100%', background: '#ede5cf' }} />
        }
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Book3D principal — mobile-first
───────────────────────────────────────── */
export default function Book3D({ pages, onAdd, lang, isMobile }) {
  const [spread, setSpread]         = useState(0);
  const [flipping, setFlipping]     = useState(false);
  const [flipDir, setFlipDir]       = useState(null);
  const [nextSpread, setNextSpread] = useState(0);
  const totalSpreads = Math.ceil(pages.length / 2);

  const leftPage  = pages[spread * 2]     || null;
  const rightPage = pages[spread * 2 + 1] || null;

  const flip = useCallback((dir) => {
    if (flipping) return;
    if (dir === 'next' && spread >= totalSpreads - 1) return;
    if (dir === 'prev' && spread <= 0) return;

    const next = dir === 'next' ? spread + 1 : spread - 1;
    setFlipDir(dir); setNextSpread(next); setFlipping(true);
    setTimeout(() => { setSpread(next); setFlipping(false); setFlipDir(null); }, 650);
  }, [flipping, spread, totalSpreads]);

  // Swipe tactile
  const touchStart = useRef(null);
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) flip(diff > 0 ? 'next' : 'prev');
    touchStart.current = null;
  };

  if (!pages || pages.length === 0) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.4)' }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>📖</div>
      <p style={{ fontSize: 15 }}>Aucun produit disponible</p>
    </div>
  );

  const nextLeftPage  = pages[nextSpread * 2]     || null;
  const nextRightPage = pages[nextSpread * 2 + 1] || null;
  const flippingFromPage = flipDir === 'next' ? rightPage : leftPage;
  const flippingToPage   = flipDir === 'next' ? nextLeftPage : nextRightPage;

  // Hauteur du livre adaptée à l'écran
  const bookHeight = isMobile
    ? Math.min(window.innerHeight * 0.62, 420)
    : 520;

  // Sur mobile : on affiche UNE seule page à la fois
  // Sur desktop : double page (livre ouvert)
  if (isMobile) {
    // ── MODE MOBILE : une page à la fois ──
    const currentPage = pages[spread] || null;
    const totalPages  = pages.length;

    const flipMobile = (dir) => {
      if (flipping) return;
      if (dir === 'next' && spread >= totalPages - 1) return;
      if (dir === 'prev' && spread <= 0) return;

      const next = dir === 'next' ? spread + 1 : spread - 1;
      setFlipDir(dir); setNextSpread(next); setFlipping(true);
      setTimeout(() => { setSpread(next); setFlipping(false); setFlipDir(null); }, 600);
    };

    const onTouchEndMobile = (e) => {
      if (touchStart.current === null) return;
      const diff = touchStart.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 35) flipMobile(diff > 0 ? 'next' : 'prev');
      touchStart.current = null;
    };

    const nextPage = pages[nextSpread] || null;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>

        {/* Livre mobile — 1 page */}
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEndMobile}
          style={{ width: '100%', maxWidth: 380, perspective: '1500px', userSelect: 'none' }}
        >
          <div style={{
            height: bookHeight, position: 'relative',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 8px 20px rgba(0,0,0,0.5)',
            borderRadius: 12,
            transformStyle: 'preserve-3d',
          }}>
            {/* Page courante */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden',
              opacity: flipping ? 0 : 1,
            }}>
              {currentPage
                ? <PageContent produits={currentPage.produits} categorie={currentPage.categorie}
                    pageNum={spread + 1} totalPages={totalPages}
                    onAdd={onAdd} lang={lang} side="right" isMobile={true} />
                : <div style={{ width: '100%', height: '100%', background: '#f5efe0' }} />
              }
            </div>

            {/* Page suivante (fond pendant animation) */}
            {flipping && nextPage && (
              <div style={{ position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden', zIndex: 5 }}>
                <PageContent produits={nextPage.produits} categorie={nextPage.categorie}
                  pageNum={nextSpread + 1} totalPages={totalPages}
                  onAdd={onAdd} lang={lang} side="right" isMobile={true} />
              </div>
            )}

            {/* Page animée mobile */}
            {flipping && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 12,
                transformOrigin: flipDir === 'next' ? 'left center' : 'right center',
                transformStyle: 'preserve-3d',
                animation: `pageFlipMobile 0.6s cubic-bezier(0.645,0.045,0.355,1.000) forwards`,
                zIndex: 20,
                '--end-m': flipDir === 'next' ? '-180deg' : '180deg',
              }}>
                <style>{`
                  @keyframes pageFlipMobile {
                    from { transform: rotateY(0deg); }
                    to   { transform: rotateY(var(--end-m)); }
                  }
                `}</style>
                {/* Face avant */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden',
                  backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                }}>
                  {currentPage && <PageContent produits={currentPage.produits} categorie={currentPage.categorie}
                    pageNum={spread + 1} totalPages={totalPages} onAdd={onAdd} lang={lang} side="right" isMobile={true} />}
                </div>
                {/* Face arrière */}
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden',
                  backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg) scaleX(-1)',
                }}>
                  {nextPage && <PageContent produits={nextPage.produits} categorie={nextPage.categorie}
                    pageNum={nextSpread + 1} totalPages={totalPages} onAdd={onAdd} lang={lang} side="right" isMobile={true} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', maxWidth: 380 }}>
          <button onClick={() => flipMobile('prev')} disabled={spread === 0 || flipping} style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: spread === 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#c9a84c,#e8d08a)',
            border: 'none', color: spread === 0 ? 'rgba(255,255,255,0.15)' : '#1a0a00',
            fontSize: 20, cursor: spread === 0 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'manipulation',
          }}>‹</button>

          {/* Points indicateurs */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap' }}>
            {Array.from({ length: Math.min(totalPages, 10) }).map((_, i) => (
              <div key={i} onClick={() => !flipping && setSpread(i)} style={{
                width: i === spread ? 18 : 6, height: 6, borderRadius: 3,
                background: i === spread ? '#c9a84c' : 'rgba(201,168,76,0.2)',
                transition: 'all 0.3s', cursor: 'pointer', touchAction: 'manipulation',
              }} />
            ))}
          </div>

          <button onClick={() => flipMobile('next')} disabled={spread >= totalPages - 1 || flipping} style={{
            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
            background: spread >= totalPages - 1 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#c9a84c,#e8d08a)',
            border: 'none', color: spread >= totalPages - 1 ? 'rgba(255,255,255,0.15)' : '#1a0a00',
            fontSize: 20, cursor: spread >= totalPages - 1 ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'manipulation',
          }}>›</button>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(201,168,76,0.3)', fontStyle: 'italic' }}>
          ← Glissez pour tourner →
        </p>
      </div>
    );
  }

  // ── MODE DESKTOP : double page ──
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        style={{ width: '100%', maxWidth: 820, perspective: '2500px', userSelect: 'none' }}>
        <div style={{
          display: 'flex', height: bookHeight, position: 'relative',
          boxShadow: '0 30px 80px rgba(0,0,0,0.85), 0 10px 30px rgba(0,0,0,0.5)',
          borderRadius: '4px 14px 14px 4px',
          transformStyle: 'preserve-3d',
        }}>
          {/* Reliure */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: 10,
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to right,#2a1008,#7a3810,#2a1008)',
            zIndex: 15, boxShadow: '0 0 18px rgba(0,0,0,0.5)',
          }} />

          {/* Page gauche */}
          <div style={{
            flex: 1, overflow: 'hidden', borderRadius: '8px 0 0 8px',
            opacity: flipping && flipDir === 'prev' ? 0 : 1,
          }}>
            {leftPage
              ? <PageContent produits={leftPage.produits} categorie={leftPage.categorie}
                  pageNum={spread * 2 + 1} totalPages={pages.length} onAdd={onAdd} lang={lang} side="left" isMobile={false} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to left,#e8dcc8,#f5efe0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(90,58,26,0.2)', fontSize: 40 }}>✦</span>
                </div>
            }
          </div>

          {/* Page droite */}
          <div style={{
            flex: 1, overflow: 'hidden', borderRadius: '0 8px 8px 0',
            opacity: flipping && flipDir === 'next' ? 0 : 1,
          }}>
            {rightPage
              ? <PageContent produits={rightPage.produits} categorie={rightPage.categorie}
                  pageNum={spread * 2 + 2} totalPages={pages.length} onAdd={onAdd} lang={lang} side="right" isMobile={false} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right,#e8dcc8,#f5efe0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(90,58,26,0.2)', fontSize: 40 }}>✦</span>
                </div>
            }
          </div>

          {/* Pages du spread suivant en fond */}
          {flipping && (
            <>
              {flipDir === 'next' && nextLeftPage && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', overflow: 'hidden', borderRadius: '8px 0 0 8px', zIndex: 5 }}>
                  <PageContent produits={nextLeftPage.produits} categorie={nextLeftPage.categorie}
                    pageNum={nextSpread * 2 + 1} totalPages={pages.length} onAdd={onAdd} lang={lang} side="left" isMobile={false} />
                </div>
              )}
              {flipDir === 'prev' && nextRightPage && (
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', overflow: 'hidden', borderRadius: '0 8px 8px 0', zIndex: 5 }}>
                  <PageContent produits={nextRightPage.produits} categorie={nextRightPage.categorie}
                    pageNum={nextSpread * 2 + 2} totalPages={pages.length} onAdd={onAdd} lang={lang} side="right" isMobile={false} />
                </div>
              )}
            </>
          )}

          {/* Page animée */}
          <FlippingPage
            flipping={flipping} flipDir={flipDir}
            fromPage={flippingFromPage} toPage={flippingToPage}
            onAdd={onAdd} lang={lang}
            totalPages={pages.length} spreadIndex={spread} isMobile={false}
          />
        </div>
      </div>

      {/* Navigation desktop */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <button onClick={() => flip('prev')} disabled={spread === 0 || flipping} style={{
          width: 46, height: 46, borderRadius: '50%',
          background: spread === 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#c9a84c,#e8d08a)',
          border: 'none', color: spread === 0 ? 'rgba(255,255,255,0.15)' : '#1a0a00',
          fontSize: 22, cursor: spread === 0 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: spread === 0 ? 'none' : '0 4px 14px rgba(201,168,76,0.4)',
        }}>‹</button>

        <div style={{ display: 'flex', gap: 7 }}>
          {Array.from({ length: totalSpreads }).map((_, i) => (
            <div key={i} onClick={() => !flipping && setSpread(i)} style={{
              width: i === spread ? 22 : 7, height: 7, borderRadius: 4,
              background: i === spread ? '#c9a84c' : 'rgba(201,168,76,0.2)',
              transition: 'all 0.3s', cursor: 'pointer',
            }} />
          ))}
        </div>

        <button onClick={() => flip('next')} disabled={spread >= totalSpreads - 1 || flipping} style={{
          width: 46, height: 46, borderRadius: '50%',
          background: spread >= totalSpreads - 1 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#c9a84c,#e8d08a)',
          border: 'none', color: spread >= totalSpreads - 1 ? 'rgba(255,255,255,0.15)' : '#1a0a00',
          fontSize: 22, cursor: spread >= totalSpreads - 1 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: spread >= totalSpreads - 1 ? 'none' : '0 4px 14px rgba(201,168,76,0.4)',
        }}>›</button>
      </div>

      <p style={{ fontSize: 11, color: 'rgba(201,168,76,0.3)', fontStyle: 'italic' }}>
        ← Glissez ou utilisez les flèches →
      </p>
    </div>
  );
}

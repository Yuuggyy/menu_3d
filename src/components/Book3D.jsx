import { useState, useRef, useCallback } from 'react';

/* ─────────────────────────────────────────
   Carte produit — micro-animations + luxe
───────────────────────────────────────── */
function ProduitCard({ produit, onAdd, lang, isMobile }) {
  const [qty, setQty] = useState(0);
  const [hovered, setHovered] = useState(false);
  const L = lang === 'en' ? { add: 'Order' } : { add: 'Ajouter' };

  const handleAdd = () => {
    if (qty === 0) return;
    onAdd({ ...produit, prix_unit: produit.prix, quantite: qty });
    setQty(0);
  };

  return (
    <div
      className="produit-card-hover"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', gap: isMobile ? 8 : 10,
        padding: isMobile ? '8px 6px' : '10px 8px',
        borderBottom: '1px solid rgba(90,58,26,0.18)',
        alignItems: 'center',
        background: hovered ? 'rgba(201,168,76,0.05)' : 'transparent',
      }}>
      {/* Image avec zoom */}
      <div className="produit-img-wrap" style={{
        width: isMobile ? 46 : 58, height: isMobile ? 46 : 58,
        borderRadius: 8, flexShrink: 0,
        background: 'rgba(90,58,26,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: hovered ? '1px solid rgba(201,168,76,0.4)' : '1px solid transparent',
        transition: 'border 0.2s ease',
      }}>
        {produit.image_url
          ? <img src={produit.image_url} alt={produit.nom}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: isMobile ? 18 : 24 }}>🍽️</span>}
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
          fontSize: isMobile ? 13 : 15, fontWeight: 700, color: '#1a0a00',
          lineHeight: 1.3, marginBottom: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          letterSpacing: '0.2px',
        }}>{produit.nom}</p>
        {produit.description && !isMobile && (
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 11, color: '#7a5a3a', lineHeight: 1.4, marginBottom: 3,
            fontStyle: 'italic',
          }}>
            {produit.description.length > 50 ? produit.description.slice(0, 50) + '…' : produit.description}
          </p>
        )}
        <p style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: isMobile ? 15 : 17, fontWeight: 700, color: '#7a4010',
          letterSpacing: '-0.3px',
        }}>
          {Number(produit.prix).toFixed(2)}<span style={{ fontSize: 10, fontWeight: 500, color: '#9a6a3a' }}> €</span>
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
            background: 'linear-gradient(135deg, #8B4513, #b0541a)',
            color: 'white',
            fontSize: isMobile ? 15 : 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'manipulation',
            boxShadow: '0 2px 6px rgba(139,69,19,0.35)',
          }}>+</button>
        </div>
        {qty > 0 && (
          <button onClick={handleAdd} style={{
            background: 'linear-gradient(135deg,#8B4513,#c0622a)', color: 'white',
            border: 'none', borderRadius: 5,
            padding: isMobile ? '4px 8px' : '3px 7px',
            fontSize: isMobile ? 10 : 9, fontWeight: 700,
            cursor: 'pointer', whiteSpace: 'nowrap', touchAction: 'manipulation',
            boxShadow: '0 2px 8px rgba(139,69,19,0.4)',
          }}>✓ {L.add}</button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Ornement doré entre sections
───────────────────────────────────────── */
function GoldOrnement({ small }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: small ? 6 : 8,
      margin: small ? '4px 0' : '6px 0',
    }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(139,69,19,0.35))' }} />
      <span style={{ fontSize: small ? 8 : 10, color: 'rgba(139,69,19,0.5)', letterSpacing: 3 }}>✦</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(139,69,19,0.35))' }} />
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
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 24px, rgba(90,58,26,0.05) 24px, rgba(90,58,26,0.05) 25px)',
        backgroundPositionY: '44px',
      }} />

      {/* En-tête catégorie avec Cormorant */}
      {categorie && (
        <>
          <div style={{
            marginBottom: isMobile ? 4 : 8,
            paddingBottom: isMobile ? 4 : 6,
            display: 'flex', alignItems: 'center', gap: 5,
            position: 'relative',
          }}>
            <span style={{ fontSize: isMobile ? 14 : 16 }}>{categorie.emoji || '🍽️'}</span>
            <span style={{
              fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
              fontSize: isMobile ? 15 : 18, fontWeight: 700, color: '#7a4010',
              letterSpacing: '0.5px',
            }}>{categorie.nom}</span>
          </div>
          <GoldOrnement small={isMobile} />
        </>
      )}

      {/* Produits */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {produits.map((p, i) => (
          <div key={p.id}>
            <ProduitCard produit={p} onAdd={onAdd} lang={lang} isMobile={isMobile} />
          </div>
        ))}
      </div>

      {/* Numéro de page — style luxe */}
      <p style={{
        textAlign: side === 'left' ? 'left' : 'right',
        fontSize: 9, color: 'rgba(90,58,26,0.3)',
        fontStyle: 'italic', marginTop: 4,
        fontFamily: "'Cormorant Garamond', serif",
        position: 'relative', letterSpacing: '1px',
      }}>{pageNum} / {totalPages}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page animée (tourne 180°)
───────────────────────────────────────── */
function FlippingPage({ flipping, flipDir, fromPage, toPage, onAdd, lang, totalPages, spreadIndex, isMobile }) {
  if (!flipping) return null;

  const isNext   = flipDir === 'next';
  const origin   = isNext ? 'left center' : 'right center';
  const endAngle = isNext ? -180 : 180;

  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0,
      left:  isNext ? '50%' : 0,
      right: isNext ? 0    : '50%',
      transformOrigin: origin,
      transformStyle: 'preserve-3d',
      animation: `pageFlip 0.65s cubic-bezier(0.645,0.045,0.355,1.000) forwards`,
      zIndex: 20,
      '--end-angle': endAngle + 'deg',
    }}>
      <style>{`
        @keyframes pageFlip {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(var(--end-angle)); }
        }
      `}</style>

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
      <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
      <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: 'italic' }}>
        {lang === 'en' ? 'No items available' : 'Aucun plat disponible'}
      </p>
    </div>
  );

  /* ── MOBILE : une seule page ── */
  if (isMobile) {
    const page = pages[spread] || null;
    const totalMobile = pages.length;

    return (
      <div style={{ width: '100%' }}>
        {/* Livre mobile */}
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{
            background: 'linear-gradient(to right, #e8dcc8, #f5efe0)',
            borderRadius: 12,
            boxShadow: '0 20px 50px rgba(0,0,0,0.6), 3px 0 0 #d4c4a0, 6px 0 0 #c8b890',
            padding: '14px 12px 10px',
            minHeight: 340,
            position: 'relative',
            overflow: 'hidden',
          }}>

          {/* Lignes cahier */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 24px, rgba(90,58,26,0.05) 24px, rgba(90,58,26,0.05) 25px)',
            backgroundPositionY: '44px',
          }} />

          {page && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>{page.categorie?.emoji || '🍽️'}</span>
                <span style={{
                  fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                  fontSize: 15, fontWeight: 700, color: '#7a4010', letterSpacing: '0.3px',
                }}>{page.categorie?.nom}</span>
              </div>
              <GoldOrnement small />
              {page.produits.map(p => (
                <ProduitCard key={p.id} produit={p} onAdd={onAdd} lang={lang} isMobile={true} />
              ))}
            </>
          )}

          <p style={{
            textAlign: 'right', fontSize: 9, color: 'rgba(90,58,26,0.3)',
            fontStyle: 'italic', marginTop: 6,
            fontFamily: "'Cormorant Garamond', serif", letterSpacing: '1px',
            position: 'relative',
          }}>{spread + 1} / {totalMobile}</p>
        </div>

        {/* Navigation mobile */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 20, marginTop: 16 }}>
          <button onClick={() => flip('prev')} disabled={spread <= 0 || flipping} style={{
            background: spread <= 0 ? 'rgba(201,168,76,0.1)' : 'rgba(201,168,76,0.2)',
            border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c',
            borderRadius: 8, padding: '10px 18px',
            fontSize: 16, cursor: spread <= 0 ? 'not-allowed' : 'pointer',
            opacity: spread <= 0 ? 0.3 : 1, transition: 'all 0.2s',
            touchAction: 'manipulation',
          }}>◀</button>

          {/* Dots */}
          <div style={{ display: 'flex', gap: 6 }}>
            {Array.from({ length: Math.min(totalMobile, 7) }).map((_, i) => {
              const pageIdx = totalMobile <= 7 ? i : Math.round(i * (totalMobile - 1) / 6);
              const active = totalMobile <= 7 ? i === spread : Math.round(spread * 6 / (totalMobile - 1)) === i;
              return (
                <div key={i} style={{
                  width: active ? 10 : 6, height: active ? 10 : 6,
                  borderRadius: '50%',
                  background: active ? '#c9a84c' : 'rgba(201,168,76,0.25)',
                  transition: 'all 0.2s ease',
                  marginTop: active ? 0 : 2,
                }} />
              );
            })}
          </div>

          <button onClick={() => flip('next')} disabled={spread >= totalMobile - 1 || flipping} style={{
            background: spread >= totalMobile - 1 ? 'rgba(201,168,76,0.1)' : 'rgba(201,168,76,0.2)',
            border: '1px solid rgba(201,168,76,0.3)', color: '#c9a84c',
            borderRadius: 8, padding: '10px 18px',
            fontSize: 16, cursor: spread >= totalMobile - 1 ? 'not-allowed' : 'pointer',
            opacity: spread >= totalMobile - 1 ? 0.3 : 1, transition: 'all 0.2s',
            touchAction: 'manipulation',
          }}>▶</button>
        </div>
      </div>
    );
  }

  /* ── DESKTOP : double page ── */
  const leftFlipFrom  = flipDir === 'next' ? rightPage : null;
  const leftFlipTo    = flipDir === 'next' ? null : pages[nextSpread * 2] || null;
  const rightFlipFrom = flipDir === 'prev' ? leftPage : null;
  const rightFlipTo   = flipDir === 'prev' ? null : pages[nextSpread * 2 + 1] || null;

  return (
    <div style={{ width: '100%' }}>
      {/* Livre desktop */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'relative',
          display: 'flex',
          height: 480,
          borderRadius: '4px 16px 16px 4px',
          boxShadow: '0 30px 70px rgba(0,0,0,0.7), 0 10px 25px rgba(0,0,0,0.5)',
          transformStyle: 'preserve-3d',
          perspective: '1500px',
          overflow: 'visible',
        }}>

        {/* Page gauche */}
        <div style={{
          flex: 1, position: 'relative',
          borderRadius: '4px 0 0 4px',
          overflow: 'hidden',
          boxShadow: 'inset 3px 0 10px rgba(0,0,0,0.15)',
        }}>
          {leftPage
            ? <PageContent produits={leftPage.produits} categorie={leftPage.categorie}
                pageNum={spread * 2 + 1} totalPages={pages.length}
                onAdd={onAdd} lang={lang} side="left" isMobile={false} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to left, #e8dcc8, #f5efe0)' }} />
          }
        </div>

        {/* Reliure centrale */}
        <div style={{
          width: 24, flexShrink: 0,
          background: 'linear-gradient(to right, #1a0800, #3d1a00, #1a0800)',
          boxShadow: '0 0 20px rgba(0,0,0,0.5)',
          position: 'relative', zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: 2, height: '70%',
            background: 'linear-gradient(to bottom, transparent, rgba(201,168,76,0.4), transparent)',
          }} />
        </div>

        {/* Page droite */}
        <div style={{
          flex: 1, position: 'relative',
          borderRadius: '0 16px 16px 0',
          overflow: 'hidden',
          boxShadow: 'inset -3px 0 10px rgba(0,0,0,0.08)',
        }}>
          {rightPage
            ? <PageContent produits={rightPage.produits} categorie={rightPage.categorie}
                pageNum={spread * 2 + 2} totalPages={pages.length}
                onAdd={onAdd} lang={lang} side="right" isMobile={false} />
            : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, #e8dcc8, #f5efe0)' }} />
          }
        </div>

        {/* Page en animation flip */}
        <FlippingPage
          flipping={flipping} flipDir={flipDir}
          fromPage={flipDir === 'next' ? rightPage : leftPage}
          toPage={flipDir === 'next'
            ? pages[nextSpread * 2] || null
            : pages[nextSpread * 2 + 1] || null}
          onAdd={onAdd} lang={lang}
          totalPages={pages.length}
          spreadIndex={spread}
          isMobile={false}
        />

        {/* Pages visibles sur la tranche */}
        <div style={{
          position: 'absolute', right: -10, top: 4, bottom: 4,
          width: 10,
          background: 'repeating-linear-gradient(to bottom, #f5efe0 0px, #f5efe0 2px, #e0d4ba 2px, #e0d4ba 4px)',
          borderRadius: '0 2px 2px 0',
          boxShadow: '3px 0 8px rgba(0,0,0,0.3)',
        }} />
      </div>

      {/* Navigation desktop */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 24, marginTop: 20 }}>
        <button onClick={() => flip('prev')} disabled={spread <= 0 || flipping} style={{
          background: 'transparent',
          border: '1px solid rgba(201,168,76,0.35)',
          color: '#c9a84c', borderRadius: 8,
          padding: '8px 20px', fontSize: 13,
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600, letterSpacing: '1px',
          cursor: spread <= 0 ? 'not-allowed' : 'pointer',
          opacity: spread <= 0 ? 0.3 : 1,
          transition: 'all 0.2s',
        }}>◀ {lang === 'en' ? 'Previous' : 'Précédent'}</button>

        <span style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 13, color: 'rgba(201,168,76,0.5)',
          fontStyle: 'italic', letterSpacing: '1px',
        }}>{spread + 1} / {totalSpreads}</span>

        <button onClick={() => flip('next')} disabled={spread >= totalSpreads - 1 || flipping} style={{
          background: 'transparent',
          border: '1px solid rgba(201,168,76,0.35)',
          color: '#c9a84c', borderRadius: 8,
          padding: '8px 20px', fontSize: 13,
          fontFamily: "'Cormorant Garamond', serif",
          fontWeight: 600, letterSpacing: '1px',
          cursor: spread >= totalSpreads - 1 ? 'not-allowed' : 'pointer',
          opacity: spread >= totalSpreads - 1 ? 0.3 : 1,
          transition: 'all 0.2s',
        }}>{lang === 'en' ? 'Next' : 'Suivant'} ▶</button>
      </div>
    </div>
  );
}

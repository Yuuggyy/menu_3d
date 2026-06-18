import { useState, useRef, useCallback, useEffect } from 'react';

const ITEMS_PER_PAGE = 4;

/* ─────────────────────────────────────────
   Carte produit
───────────────────────────────────────── */
function ProduitCard({ produit, onAdd, lang }) {
  const [qty, setQty] = useState(0);
  const L = lang === 'en'
    ? { add: 'Order' }
    : { add: 'Commander' };

  const handleAdd = () => {
    if (qty === 0) return;
    onAdd({ ...produit, prix_unit: produit.prix, quantite: qty });
    setQty(0);
  };

  return (
    <div style={{
      display: 'flex', gap: 10, padding: '10px 0',
      borderBottom: '1px solid rgba(90,58,26,0.25)',
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
        background: 'rgba(90,58,26,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {produit.image_url
          ? <img src={produit.image_url} alt={produit.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span style={{ fontSize: 22 }}>🍽️</span>}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 700, color: '#1a0a00', marginBottom: 2, lineHeight: 1.3 }}>
          {produit.nom}
        </p>
        {produit.description && (
          <p style={{ fontSize: 10, color: '#7a5a3a', lineHeight: 1.4, marginBottom: 3 }}>
            {produit.description.length > 50 ? produit.description.slice(0, 50) + '…' : produit.description}
          </p>
        )}
        <p style={{ fontSize: 14, fontWeight: 800, color: '#8B4513' }}>
          {Number(produit.prix).toFixed(2)} <span style={{ fontSize: 10, fontWeight: 500 }}>€</span>
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <button onClick={() => setQty(q => Math.max(0, q - 1))} style={{
            width: 22, height: 22, borderRadius: '50%', border: '1px solid #8B4513',
            background: 'transparent', color: '#8B4513', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>−</button>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#1a0a00', minWidth: 14, textAlign: 'center' }}>{qty}</span>
          <button onClick={() => setQty(q => q + 1)} style={{
            width: 22, height: 22, borderRadius: '50%', border: 'none',
            background: '#8B4513', color: 'white', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>+</button>
        </div>
        {qty > 0 && (
          <button onClick={handleAdd} style={{
            background: 'linear-gradient(135deg,#8B4513,#c0622a)', color: 'white',
            border: 'none', borderRadius: 5, padding: '3px 8px',
            fontSize: 9, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>✓ {L.add}</button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Contenu d'une face de page (papier)
───────────────────────────────────────── */
function PageContent({ produits, categorie, pageNum, totalPages, onAdd, lang, side }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: side === 'left'
        ? 'linear-gradient(to left, #e8dcc8, #f5efe0)'
        : 'linear-gradient(to right, #e8dcc8, #f5efe0)',
      padding: '20px 16px',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      boxShadow: side === 'left'
        ? 'inset -6px 0 18px rgba(0,0,0,0.1)'
        : 'inset 6px 0 18px rgba(0,0,0,0.1)',
    }}>
      {/* Lignes cahier */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 26px, rgba(90,58,26,0.07) 26px, rgba(90,58,26,0.07) 27px)',
        backgroundPositionY: '50px',
      }} />

      {/* Catégorie */}
      {categorie && (
        <div style={{ borderBottom: '2px solid rgba(139,69,19,0.25)', marginBottom: 10, paddingBottom: 7, display: 'flex', alignItems: 'center', gap: 7, position: 'relative' }}>
          <span style={{ fontSize: 16 }}>{categorie.emoji || '🍽️'}</span>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 700, color: '#8B4513' }}>{categorie.nom}</span>
        </div>
      )}

      {/* Produits */}
      <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
        {produits.map(p => <ProduitCard key={p.id} produit={p} onAdd={onAdd} lang={lang} />)}
      </div>

      {/* Numéro page */}
      <p style={{
        textAlign: side === 'left' ? 'left' : 'right',
        fontSize: 10, color: 'rgba(90,58,26,0.4)', fontStyle: 'italic', marginTop: 6,
        fontFamily: "'Playfair Display',serif", position: 'relative',
      }}>{pageNum} / {totalPages}</p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Page qui tourne (la "feuille" animée)
   
   Principe du vrai flip de livre :
   - Pour aller à la page SUIVANTE : la page DROITE pivote de 0° → -180°
     sur son axe gauche (transformOrigin: left)
   - Pour aller à la page PRÉCÉDENTE : la page GAUCHE pivote de 0° → +180°
     sur son axe droit (transformOrigin: right)
   
   La page qui tourne a 2 faces (recto/verso) grâce à backface-visibility.
───────────────────────────────────────── */
function FlippingPage({ flipping, flipDir, fromPage, toPage, onAdd, lang, totalPages, spreadIndex }) {
  if (!flipping) return null;

  const isNext = flipDir === 'next';

  // La page qui tourne physiquement
  // next : la page de droite part vers la gauche (rotateY: 0 → -180, origin: left)
  // prev : la page de gauche part vers la droite (rotateY: 0 → 180, origin: right)
  const origin   = isNext ? 'left center'  : 'right center';
  const endAngle = isNext ? -180           : 180;

  // Face avant = ce qu'on voit au départ (la page qui "part")
  // Face arrière = ce qu'on voit à la fin (la nouvelle page qui "arrive" vue de derrière)
  const frontPage = fromPage; // page qui disparaît
  const backPage  = toPage;   // page qui apparaît (vue en miroir car dos de la feuille)

  return (
    <div style={{
      position: 'absolute',
      top: 0, bottom: 0,
      left:  isNext ? '50%' : 0,
      right: isNext ? 0     : '50%',
      transformOrigin: origin,
      transformStyle: 'preserve-3d',
      animation: `pageFlip 0.7s cubic-bezier(0.645, 0.045, 0.355, 1.000) forwards`,
      zIndex: 20,
      // On injecte les variables CSS pour l'animation
      '--end-angle': `${endAngle}deg`,
    }}>
      <style>{`
        @keyframes pageFlip {
          from { transform: rotateY(0deg); }
          to   { transform: rotateY(var(--end-angle)); }
        }
      `}</style>

      {/* Face AVANT — page qui part */}
      <div style={{
        position: 'absolute', inset: 0,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        overflow: 'hidden',
      }}>
        {frontPage
          ? <PageContent
              produits={frontPage.produits} categorie={frontPage.categorie}
              pageNum={isNext ? spreadIndex * 2 + 2 : spreadIndex * 2 + 1}
              totalPages={totalPages} onAdd={onAdd} lang={lang}
              side={isNext ? 'right' : 'left'}
            />
          : <div style={{ width: '100%', height: '100%', background: '#f5efe0' }} />
        }
      </div>

      {/* Face ARRIÈRE — nouvelle page (miroir horizontal) */}
      <div style={{
        position: 'absolute', inset: 0,
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg) scaleX(-1)',
        overflow: 'hidden',
        // Ombre sur le bord intérieur pour donner du relief
        boxShadow: isNext
          ? 'inset -12px 0 30px rgba(0,0,0,0.2)'
          : 'inset 12px 0 30px rgba(0,0,0,0.2)',
      }}>
        {backPage
          ? <PageContent
              produits={backPage.produits} categorie={backPage.categorie}
              pageNum={isNext ? spreadIndex * 2 + 3 : spreadIndex * 2}
              totalPages={totalPages} onAdd={onAdd} lang={lang}
              side={isNext ? 'left' : 'right'}
            />
          : <div style={{ width: '100%', height: '100%', background: '#ede5cf' }} />
        }
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Book3D principal
───────────────────────────────────────── */
export default function Book3D({ pages, onAdd, lang }) {
  const [spread, setSpread]     = useState(0);   // double page visible
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir]   = useState(null);
  const [nextSpread, setNextSpread] = useState(0); // spread qui arrive après le flip
  const totalSpreads = Math.ceil(pages.length / 2);

  const leftPage  = pages[spread * 2]     || null;
  const rightPage = pages[spread * 2 + 1] || null;

  const flip = useCallback((dir) => {
    if (flipping) return;
    if (dir === 'next' && spread >= totalSpreads - 1) return;
    if (dir === 'prev' && spread <= 0) return;

    const next = dir === 'next' ? spread + 1 : spread - 1;
    setFlipDir(dir);
    setNextSpread(next);
    setFlipping(true);

    setTimeout(() => {
      setSpread(next);
      setFlipping(false);
      setFlipDir(null);
    }, 700);
  }, [flipping, spread, totalSpreads]);

  // Swipe tactile
  const touchStart = useRef(null);
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (!touchStart.current) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) flip(diff > 0 ? 'next' : 'prev');
    touchStart.current = null;
  };

  if (!pages || pages.length === 0) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.4)' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
      <p style={{ fontSize: 16 }}>Aucun produit disponible</p>
    </div>
  );

  // Pages du spread qui arrive (pour la face arrière de la page qui tourne)
  const nextLeftPage  = pages[nextSpread * 2]     || null;
  const nextRightPage = pages[nextSpread * 2 + 1] || null;

  // La page qui tourne physiquement et la page qui arrive derrière
  const flippingFromPage = flipDir === 'next' ? rightPage : leftPage;
  const flippingToPage   = flipDir === 'next' ? nextLeftPage : nextRightPage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>

      {/* ══ LE LIVRE ══ */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ width: '100%', maxWidth: 820, perspective: '2500px', userSelect: 'none' }}
      >
        <div style={{
          display: 'flex', height: 530, position: 'relative',
          boxShadow: '0 35px 90px rgba(0,0,0,0.85), 0 12px 35px rgba(0,0,0,0.5)',
          borderRadius: '4px 14px 14px 4px',
          transformStyle: 'preserve-3d',
        }}>

          {/* ── Tranche centrale (reliure) ── */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: 10,
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to right, #2a1008, #7a3810, #2a1008)',
            zIndex: 15, boxShadow: '0 0 20px rgba(0,0,0,0.6)',
          }} />

          {/* ── Page GAUCHE (statique) ── */}
          <div style={{
            flex: 1, overflow: 'hidden', borderRadius: '8px 0 0 8px',
            // Pendant un flip "prev", on cache la page gauche car c'est elle qui tourne
            opacity: flipping && flipDir === 'prev' ? 0 : 1,
          }}>
            {leftPage
              ? <PageContent
                  produits={leftPage.produits} categorie={leftPage.categorie}
                  pageNum={spread * 2 + 1} totalPages={pages.length}
                  onAdd={onAdd} lang={lang} side="left"
                />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to left,#e8dcc8,#f5efe0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(90,58,26,0.2)', fontSize: 40 }}>✦</span>
                </div>
            }
          </div>

          {/* ── Page DROITE (statique) ── */}
          <div style={{
            flex: 1, overflow: 'hidden', borderRadius: '0 8px 8px 0',
            // Pendant un flip "next", on cache la page droite car c'est elle qui tourne
            opacity: flipping && flipDir === 'next' ? 0 : 1,
          }}>
            {rightPage
              ? <PageContent
                  produits={rightPage.produits} categorie={rightPage.categorie}
                  pageNum={spread * 2 + 2} totalPages={pages.length}
                  onAdd={onAdd} lang={lang} side="right"
                />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right,#e8dcc8,#f5efe0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(90,58,26,0.2)', fontSize: 40 }}>✦</span>
                </div>
            }
          </div>

          {/* ── Pages statiques du spread suivant (visibles DERRIÈRE la page qui tourne) ── */}
          {flipping && (
            <>
              {/* Gauche du spread suivant (visible quand on tourne vers suivant) */}
              {flipDir === 'next' && nextLeftPage && (
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '50%', overflow: 'hidden', borderRadius: '8px 0 0 8px', zIndex: 5 }}>
                  <PageContent produits={nextLeftPage.produits} categorie={nextLeftPage.categorie}
                    pageNum={nextSpread * 2 + 1} totalPages={pages.length} onAdd={onAdd} lang={lang} side="left" />
                </div>
              )}
              {/* Droite du spread précédent (visible quand on tourne vers précédent) */}
              {flipDir === 'prev' && nextRightPage && (
                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '50%', overflow: 'hidden', borderRadius: '0 8px 8px 0', zIndex: 5 }}>
                  <PageContent produits={nextRightPage.produits} categorie={nextRightPage.categorie}
                    pageNum={nextSpread * 2 + 2} totalPages={pages.length} onAdd={onAdd} lang={lang} side="right" />
                </div>
              )}
            </>
          )}

          {/* ── LA PAGE QUI TOURNE (animation flip) ── */}
          <FlippingPage
            flipping={flipping} flipDir={flipDir}
            fromPage={flippingFromPage} toPage={flippingToPage}
            onAdd={onAdd} lang={lang}
            totalPages={pages.length} spreadIndex={spread}
          />

          {/* Ombre portée du livre sur la table */}
          <div style={{
            position: 'absolute', bottom: -20, left: '5%', right: '5%', height: 20,
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
            filter: 'blur(8px)', zIndex: -1,
          }} />
        </div>
      </div>

      {/* ══ NAVIGATION ══ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <button onClick={() => flip('prev')} disabled={spread === 0 || flipping} style={{
          width: 46, height: 46, borderRadius: '50%',
          background: spread === 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#c9a84c,#e8d08a)',
          border: 'none',
          color: spread === 0 ? 'rgba(255,255,255,0.15)' : '#1a0a00',
          fontSize: 22, cursor: spread === 0 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: spread === 0 ? 'none' : '0 4px 15px rgba(201,168,76,0.4)',
          transition: 'all 0.2s',
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
          border: 'none',
          color: spread >= totalSpreads - 1 ? 'rgba(255,255,255,0.15)' : '#1a0a00',
          fontSize: 22, cursor: spread >= totalSpreads - 1 ? 'not-allowed' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: spread >= totalSpreads - 1 ? 'none' : '0 4px 15px rgba(201,168,76,0.4)',
          transition: 'all 0.2s',
        }}>›</button>
      </div>

      <p style={{ fontSize: 11, color: 'rgba(201,168,76,0.35)', fontStyle: 'italic' }}>
        ← Glissez ou utilisez les flèches →
      </p>
    </div>
  );
}

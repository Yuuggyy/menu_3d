import { useState, useRef, useCallback } from 'react';

/* ══════════════════════════════════════════════
   BOOK 3D — Animation flip de page style cahier
   ══════════════════════════════════════════════ */

const ITEMS_PER_PAGE = 4; // produits par face de page

// Carte produit individuelle
function ProduitCard({ produit, onAdd, lang }) {
  const [qty, setQty] = useState(0);
  const labels = {
    fr: { add: 'Commander', added: 'Ajouté', noImg: 'Photo bientôt' },
    en: { add: 'Order',     added: 'Added',  noImg: 'Photo coming soon' },
  };
  const L = labels[lang] || labels.fr;

  const handleAdd = () => {
    if (qty === 0) return;
    onAdd({ ...produit, prix_unit: produit.prix, quantite: qty });
    setQty(0);
  };

  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 0',
      borderBottom: '1px solid rgba(90,58,26,0.3)',
      alignItems: 'flex-start',
    }}>
      {/* Image */}
      <div style={{
        width: 64, height: 64, borderRadius: 10, overflow: 'hidden',
        background: 'rgba(90,58,26,0.2)', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {produit.image_url ? (
          <img src={produit.image_url} alt={produit.nom}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 24 }}>🍽️</span>
        )}
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 14, fontWeight: 700, color: '#1a0a00',
          marginBottom: 2, lineHeight: 1.3,
        }}>{produit.nom}</p>
        {produit.description && (
          <p style={{ fontSize: 11, color: '#7a5a3a', lineHeight: 1.4, marginBottom: 4 }}>
            {produit.description.length > 55 ? produit.description.slice(0, 55) + '…' : produit.description}
          </p>
        )}
        <p style={{ fontSize: 15, fontWeight: 800, color: '#8B4513' }}>
          {Number(produit.prix).toFixed(2)} <span style={{ fontSize: 11, fontWeight: 500 }}>€</span>
        </p>
      </div>

      {/* Qty + Ajouter */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setQty(q => Math.max(0, q - 1))}
            style={{
              width: 24, height: 24, borderRadius: '50%', border: '1px solid #8B4513',
              background: 'transparent', color: '#8B4513', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>−</button>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#1a0a00', minWidth: 16, textAlign: 'center' }}>{qty}</span>
          <button
            onClick={() => setQty(q => q + 1)}
            style={{
              width: 24, height: 24, borderRadius: '50%', border: 'none',
              background: '#8B4513', color: 'white', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
        </div>
        {qty > 0 && (
          <button
            onClick={handleAdd}
            style={{
              background: 'linear-gradient(135deg, #8B4513, #c0622a)',
              color: 'white', border: 'none', borderRadius: 6,
              padding: '4px 10px', fontSize: 10, fontWeight: 700,
              cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >✓ {L.add}</button>
        )}
      </div>
    </div>
  );
}

// Une page du livre (face gauche ou droite)
function BookPage({ produits, categorie, pageNum, totalPages, onAdd, lang, side }) {
  const isLeft = side === 'left';
  return (
    <div style={{
      width: '100%', height: '100%',
      background: isLeft
        ? 'linear-gradient(to left, #ede5cf, #f5efe0)'
        : 'linear-gradient(to right, #ede5cf, #f5efe0)',
      padding: '24px 20px',
      display: 'flex', flexDirection: 'column',
      boxShadow: isLeft
        ? 'inset -8px 0 20px rgba(0,0,0,0.12)'
        : 'inset 8px 0 20px rgba(0,0,0,0.12)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Texture lignes cahier */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(transparent, transparent 28px, rgba(90,58,26,0.08) 28px, rgba(90,58,26,0.08) 29px)',
        backgroundPositionY: '56px',
      }} />

      {/* En-tête catégorie */}
      {categorie && (
        <div style={{
          borderBottom: '2px solid rgba(139,69,19,0.3)',
          marginBottom: 12, paddingBottom: 8,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 18 }}>{categorie.emoji || '🍽️'}</span>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 16, fontWeight: 700, color: '#8B4513',
          }}>{categorie.nom}</span>
        </div>
      )}

      {/* Liste produits */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {produits.map(p => (
          <ProduitCard key={p.id} produit={p} onAdd={onAdd} lang={lang} />
        ))}
      </div>

      {/* Numéro de page */}
      <p style={{
        textAlign: isLeft ? 'left' : 'right',
        fontSize: 11, color: 'rgba(90,58,26,0.5)',
        fontStyle: 'italic', marginTop: 8,
        fontFamily: "'Playfair Display', serif",
      }}>{pageNum} / {totalPages}</p>
    </div>
  );
}

// ══ Composant principal Book3D ══
export default function Book3D({ pages, onAdd, lang }) {
  const [currentSpread, setCurrentSpread] = useState(0); // indice de la "double page"
  const [flipping, setFlipping]           = useState(false);
  const [flipDir, setFlipDir]             = useState(null); // 'next' | 'prev'
  const totalSpreads = Math.ceil(pages.length / 2);

  const leftPage  = pages[currentSpread * 2]     || null;
  const rightPage = pages[currentSpread * 2 + 1] || null;

  const flip = useCallback((dir) => {
    if (flipping) return;
    if (dir === 'next' && currentSpread >= totalSpreads - 1) return;
    if (dir === 'prev' && currentSpread <= 0) return;

    setFlipDir(dir);
    setFlipping(true);
    setTimeout(() => {
      setCurrentSpread(s => dir === 'next' ? s + 1 : s - 1);
      setFlipping(false);
      setFlipDir(null);
    }, 600);
  }, [flipping, currentSpread, totalSpreads]);

  // Swipe mobile
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
      {/* ── Le Livre ── */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          width: '100%', maxWidth: 800,
          perspective: '2000px',
          userSelect: 'none',
        }}
      >
        <div style={{
          display: 'flex',
          height: 520,
          boxShadow: '0 30px 80px rgba(0,0,0,0.8), 0 10px 30px rgba(0,0,0,0.5)',
          borderRadius: '2px 12px 12px 2px',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}>
          {/* Tranche du livre */}
          <div style={{
            position: 'absolute', left: '50%', top: 0, bottom: 0, width: 8,
            transform: 'translateX(-50%)',
            background: 'linear-gradient(to right, #3a1a08, #6b3010, #3a1a08)',
            zIndex: 10, boxShadow: '0 0 15px rgba(0,0,0,0.5)',
          }} />

          {/* Page gauche */}
          <div style={{
            flex: 1, overflow: 'hidden',
            borderRadius: '8px 0 0 8px',
            transformOrigin: 'right center',
            transform: flipping && flipDir === 'prev'
              ? 'rotateY(-20deg)'
              : 'rotateY(0deg)',
            transition: flipping ? 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1.000)' : 'none',
            transformStyle: 'preserve-3d',
          }}>
            {leftPage ? (
              <BookPage
                produits={leftPage.produits}
                categorie={leftPage.categorie}
                pageNum={currentSpread * 2 + 1}
                totalPages={pages.length}
                onAdd={onAdd}
                lang={lang}
                side="left"
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to left, #ede5cf, #f5efe0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'rgba(90,58,26,0.3)', fontSize: 40 }}>✦</span>
              </div>
            )}
          </div>

          {/* Page droite avec animation flip */}
          <div style={{
            flex: 1, overflow: 'hidden',
            borderRadius: '0 8px 8px 0',
            transformOrigin: 'left center',
            transform: flipping && flipDir === 'next'
              ? 'rotateY(20deg)'
              : 'rotateY(0deg)',
            transition: flipping ? 'transform 0.6s cubic-bezier(0.645, 0.045, 0.355, 1.000)' : 'none',
            transformStyle: 'preserve-3d',
          }}>
            {rightPage ? (
              <BookPage
                produits={rightPage.produits}
                categorie={rightPage.categorie}
                pageNum={currentSpread * 2 + 2}
                totalPages={pages.length}
                onAdd={onAdd}
                lang={lang}
                side="right"
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, #ede5cf, #f5efe0)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'rgba(90,58,26,0.3)', fontSize: 40 }}>✦</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <button
          onClick={() => flip('prev')}
          disabled={currentSpread === 0 || flipping}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: currentSpread === 0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #c9a84c, #e8d08a)',
            border: 'none', color: currentSpread === 0 ? 'rgba(255,255,255,0.2)' : '#1a0a00',
            fontSize: 20, cursor: currentSpread === 0 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: currentSpread === 0 ? 'none' : '0 4px 15px rgba(201,168,76,0.4)',
            transition: 'all 0.2s',
          }}
        >‹</button>

        {/* Indicateur pages */}
        <div style={{ display: 'flex', gap: 8 }}>
          {Array.from({ length: totalSpreads }).map((_, i) => (
            <div key={i} style={{
              width: i === currentSpread ? 24 : 8,
              height: 8, borderRadius: 4,
              background: i === currentSpread ? '#c9a84c' : 'rgba(201,168,76,0.25)',
              transition: 'all 0.3s ease', cursor: 'pointer',
            }} onClick={() => !flipping && setCurrentSpread(i)} />
          ))}
        </div>

        <button
          onClick={() => flip('next')}
          disabled={currentSpread >= totalSpreads - 1 || flipping}
          style={{
            width: 48, height: 48, borderRadius: '50%',
            background: currentSpread >= totalSpreads - 1 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #c9a84c, #e8d08a)',
            border: 'none', color: currentSpread >= totalSpreads - 1 ? 'rgba(255,255,255,0.2)' : '#1a0a00',
            fontSize: 20, cursor: currentSpread >= totalSpreads - 1 ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: currentSpread >= totalSpreads - 1 ? 'none' : '0 4px 15px rgba(201,168,76,0.4)',
            transition: 'all 0.2s',
          }}
        >›</button>
      </div>

      {/* Hint swipe mobile */}
      <p style={{ fontSize: 11, color: 'rgba(201,168,76,0.4)', fontStyle: 'italic' }}>
        ← Glissez pour tourner les pages →
      </p>
    </div>
  );
}

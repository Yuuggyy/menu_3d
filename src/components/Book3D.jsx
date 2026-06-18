import { useState, useRef, useCallback } from 'react';

/* ─── Carte produit ─── */
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
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      style={{
        display: 'flex', gap: 8,
        padding: isMobile ? '7px 4px' : '9px 6px',
        borderBottom: '1px solid rgba(90,58,26,0.16)',
        alignItems: 'center',
        borderRadius: 8,
        background: hovered ? 'rgba(201,168,76,0.07)' : 'transparent',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? '0 4px 14px rgba(139,69,19,0.14)' : 'none',
        transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

      {/* Image */}
      <div style={{
        width: isMobile ? 44 : 52, height: isMobile ? 44 : 52,
        borderRadius: 8, flexShrink: 0,
        background: 'rgba(90,58,26,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        border: hovered ? '1px solid rgba(201,168,76,0.4)' : '1px solid transparent',
        transition: 'border 0.2s',
      }}>
        {produit.image_url
          ? <img src={produit.image_url} alt={produit.nom}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: hovered ? 'scale(1.08)' : 'scale(1)',
                transition: 'transform 0.35s ease',
              }} />
          : <span style={{ fontSize: isMobile ? 18 : 22 }}>🍽️</span>}
      </div>

      {/* Infos */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontFamily: "'Cormorant Garamond','Playfair Display',serif",
          fontSize: isMobile ? 13 : 14, fontWeight: 700, color: '#1a0a00',
          lineHeight: 1.3, marginBottom: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          letterSpacing: '0.2px',
        }}>{produit.nom}</p>
        {produit.description && !isMobile && (
          <p style={{
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 10.5, color: '#7a5a3a', lineHeight: 1.35, marginBottom: 2,
            fontStyle: 'italic',
          }}>
            {produit.description.length > 48
              ? produit.description.slice(0, 48) + '…'
              : produit.description}
          </p>
        )}
        <p style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: isMobile ? 14 : 16, fontWeight: 700, color: '#7a4010',
          letterSpacing: '-0.2px',
        }}>
          {Number(produit.prix).toFixed(2)}
          <span style={{ fontSize: 9, fontWeight: 400, color: '#9a6a3a' }}> €</span>
        </p>
      </div>

      {/* Qty */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button onClick={() => setQty(q => Math.max(0, q - 1))} style={{
            width: isMobile ? 26 : 22, height: isMobile ? 26 : 22,
            borderRadius: '50%', border: '1.5px solid #8B4513',
            background: 'transparent', color: '#8B4513',
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'manipulation',
          }}>−</button>
          <span style={{
            fontSize: 12, fontWeight: 700, color: '#1a0a00',
            minWidth: 16, textAlign: 'center',
          }}>{qty}</span>
          <button onClick={() => setQty(q => q + 1)} style={{
            width: isMobile ? 26 : 22, height: isMobile ? 26 : 22,
            borderRadius: '50%', border: 'none',
            background: 'linear-gradient(135deg,#8B4513,#b0541a)',
            color: 'white', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            touchAction: 'manipulation',
            boxShadow: '0 2px 6px rgba(139,69,19,0.3)',
          }}>+</button>
        </div>
        {qty > 0 && (
          <button onClick={handleAdd} style={{
            background: 'linear-gradient(135deg,#8B4513,#c0622a)',
            color: 'white', border: 'none', borderRadius: 5,
            padding: '3px 7px', fontSize: 9, fontWeight: 700,
            cursor: 'pointer', whiteSpace: 'nowrap', touchAction: 'manipulation',
            boxShadow: '0 2px 7px rgba(139,69,19,0.4)',
          }}>✓ {L.add}</button>
        )}
      </div>
    </div>
  );
}

/* ─── Ornement doré ─── */
function GoldLine({ small }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      margin: small ? '3px 0 5px' : '4px 0 8px',
    }}>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right,transparent,rgba(139,69,19,0.3))' }} />
      <span style={{ fontSize: 8, color: 'rgba(139,69,19,0.45)', letterSpacing: 2 }}>✦</span>
      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left,transparent,rgba(139,69,19,0.3))' }} />
    </div>
  );
}

/* ─── Contenu d'une demi-page ─── */
function PageContent({ produits, categorie, pageNum, totalPages, onAdd, lang, side, isMobile }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: side === 'left'
        ? 'linear-gradient(to left,#e8dcc8,#f5efe0)'
        : 'linear-gradient(to right,#e8dcc8,#f5efe0)',
      padding: isMobile ? '10px 9px 6px' : '16px 12px 8px',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      boxShadow: side === 'left'
        ? 'inset -5px 0 14px rgba(0,0,0,0.1)'
        : 'inset 5px 0 14px rgba(0,0,0,0.1)',
    }}>
      {/* Lignes papier */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'repeating-linear-gradient(transparent,transparent 23px,rgba(90,58,26,0.05) 23px,rgba(90,58,26,0.05) 24px)',
        backgroundPositionY: '40px',
      }} />

      {/* En-tête catégorie */}
      {categorie && (
        <>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            marginBottom: 2, position: 'relative',
          }}>
            <span style={{ fontSize: isMobile ? 12 : 14 }}>{categorie.emoji || '🍽️'}</span>
            <span style={{
              fontFamily: "'Cormorant Garamond','Playfair Display',serif",
              fontSize: isMobile ? 13 : 16, fontWeight: 700, color: '#7a4010',
              letterSpacing: '0.4px',
            }}>{categorie.nom}</span>
          </div>
          <GoldLine small={isMobile} />
        </>
      )}

      {/* Produits */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {produits.map(p => (
          <ProduitCard key={p.id} produit={p} onAdd={onAdd} lang={lang} isMobile={isMobile} />
        ))}
      </div>

      {/* Numéro page */}
      <p style={{
        textAlign: side === 'left' ? 'left' : 'right',
        fontSize: 8, color: 'rgba(90,58,26,0.28)',
        fontStyle: 'italic', marginTop: 3,
        fontFamily: "'Cormorant Garamond',serif",
        letterSpacing: '1px', position: 'relative',
      }}>{pageNum} / {totalPages}</p>
    </div>
  );
}

/* ─── Page flip animée ─── */
function FlippingPage({ flipping, flipDir, fromPage, toPage, onAdd, lang, totalPages, spreadIndex, isMobile }) {
  if (!flipping) return null;
  const isNext   = flipDir === 'next';
  const endAngle = isNext ? -180 : 180;

  return (
    <div style={{
      position: 'absolute', top: 0, bottom: 0,
      left:  isNext ? '50%' : 0,
      right: isNext ? 0    : '50%',
      transformOrigin: isNext ? 'left center' : 'right center',
      transformStyle: 'preserve-3d',
      animation: 'pageFlip 0.65s cubic-bezier(0.645,0.045,0.355,1.000) forwards',
      zIndex: 20,
      '--end': endAngle + 'deg',
    }}>
      <style>{`
        @keyframes pageFlip {
          0%   { transform: rotateY(0deg); }
          40%  { transform: rotateY(calc(var(--end) * 0.5)) translateZ(18px); }
          100% { transform: rotateY(var(--end)); }
        }
      `}</style>

      {/* Face avant */}
      <div style={{
        position: 'absolute', inset: 0,
        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', overflow: 'hidden',
      }}>
        {fromPage
          ? <PageContent produits={fromPage.produits} categorie={fromPage.categorie}
              pageNum={isNext ? spreadIndex*2+2 : spreadIndex*2+1}
              totalPages={totalPages} onAdd={onAdd} lang={lang}
              side={isNext ? 'right' : 'left'} isMobile={isMobile} />
          : <div style={{ width:'100%',height:'100%',background:'#f5efe0' }} />}
      </div>

      {/* Face arrière */}
      <div style={{
        position: 'absolute', inset: 0,
        backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
        transform: 'rotateY(180deg) scaleX(-1)', overflow: 'hidden',
        boxShadow: isNext
          ? 'inset -12px 0 28px rgba(0,0,0,0.2)'
          : 'inset 12px 0 28px rgba(0,0,0,0.2)',
      }}>
        {toPage
          ? <PageContent produits={toPage.produits} categorie={toPage.categorie}
              pageNum={isNext ? spreadIndex*2+3 : spreadIndex*2}
              totalPages={totalPages} onAdd={onAdd} lang={lang}
              side={isNext ? 'left' : 'right'} isMobile={isMobile} />
          : <div style={{ width:'100%',height:'100%',background:'#ede5cf' }} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Book3D — composant principal
═══════════════════════════════════════ */
export default function Book3D({ pages, onAdd, lang, isMobile }) {
  const [spread, setSpread]     = useState(0);
  const [flipping, setFlipping] = useState(false);
  const [flipDir, setFlipDir]   = useState(null);
  const [nextSpread, setNextSpread] = useState(0);

  /* Mobile : 1 page à la fois. Desktop : 2 pages (spread). */
  const totalUnits = isMobile ? pages.length : Math.ceil(pages.length / 2);

  const flip = useCallback((dir) => {
    if (flipping) return;
    if (dir === 'next' && spread >= totalUnits - 1) return;
    if (dir === 'prev' && spread <= 0) return;
    const next = dir === 'next' ? spread + 1 : spread - 1;
    setFlipDir(dir); setNextSpread(next); setFlipping(true);
    setTimeout(() => { setSpread(next); setFlipping(false); setFlipDir(null); }, 650);
  }, [flipping, spread, totalUnits]);

  const touchStart = useRef(null);
  const onTouchStart = e => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    if (touchStart.current === null) return;
    const d = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) flip(d > 0 ? 'next' : 'prev');
    touchStart.current = null;
  };

  if (!pages || pages.length === 0) return (
    <div style={{ textAlign:'center', padding:'60px 20px', color:'rgba(255,255,255,0.35)' }}>
      <div style={{ fontSize:44, marginBottom:10 }}>📖</div>
      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:17, fontStyle:'italic' }}>
        {lang==='en' ? 'No items available' : 'Aucun plat disponible'}
      </p>
    </div>
  );

  /* ══ MOBILE ══ */
  if (isMobile) {
    const page = pages[spread] || null;

    return (
      <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:12 }}>

        {/* Livre — prend 100% de la largeur, hauteur auto */}
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{
            width: '100%',
            minHeight: 'calc(100dvh - 180px)',
            background: 'linear-gradient(135deg,#f5efe0 0%,#ede5cf 100%)',
            borderRadius: 14,
            boxShadow: '0 18px 48px rgba(0,0,0,0.65), 4px 0 0 #ccc0a0, 7px 0 0 #bfb090',
            padding: '14px 12px 10px',
            position: 'relative', overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
          }}>

          {/* Lignes papier */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            backgroundImage: 'repeating-linear-gradient(transparent,transparent 23px,rgba(90,58,26,0.05) 23px,rgba(90,58,26,0.05) 24px)',
            backgroundPositionY: '40px',
          }} />

          {page && (
            <>
              {/* Catégorie */}
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2, position:'relative' }}>
                <span style={{ fontSize:14 }}>{page.categorie?.emoji || '🍽️'}</span>
                <span style={{
                  fontFamily:"'Cormorant Garamond','Playfair Display',serif",
                  fontSize:15, fontWeight:700, color:'#7a4010', letterSpacing:'0.3px',
                }}>{page.categorie?.nom}</span>
              </div>
              <GoldLine small />
              <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
                {page.produits.map(p => (
                  <ProduitCard key={p.id} produit={p} onAdd={onAdd} lang={lang} isMobile />
                ))}
              </div>
            </>
          )}

          {/* Numéro */}
          <p style={{
            textAlign:'right', fontSize:8, color:'rgba(90,58,26,0.28)',
            fontStyle:'italic', marginTop:4,
            fontFamily:"'Cormorant Garamond',serif", letterSpacing:'1px', position:'relative',
          }}>{spread+1} / {pages.length}</p>
        </div>

        {/* Nav mobile */}
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:16 }}>
          <button onClick={() => flip('prev')} disabled={spread<=0||flipping} style={{
            width:44, height:44, borderRadius:22,
            background: spread<=0 ? 'rgba(201,168,76,0.08)' : 'rgba(201,168,76,0.18)',
            border:'1px solid rgba(201,168,76,0.3)', color:'#c9a84c',
            fontSize:18, cursor: spread<=0?'not-allowed':'pointer',
            opacity: spread<=0?0.3:1, transition:'all 0.2s',
            display:'flex', alignItems:'center', justifyContent:'center',
            touchAction:'manipulation',
          }}>◀</button>

          {/* Dots */}
          <div style={{ display:'flex', gap:6, alignItems:'center' }}>
            {Array.from({ length: Math.min(pages.length, 8) }).map((_, i) => {
              const idx = pages.length<=8 ? i : Math.round(i*(pages.length-1)/7);
              const active = pages.length<=8 ? i===spread : Math.round(spread*7/(pages.length-1))===i;
              return (
                <div key={i} style={{
                  width: active?10:6, height: active?10:6,
                  borderRadius:'50%',
                  background: active?'#c9a84c':'rgba(201,168,76,0.22)',
                  transition:'all 0.2s ease',
                }} />
              );
            })}
          </div>

          <button onClick={() => flip('next')} disabled={spread>=pages.length-1||flipping} style={{
            width:44, height:44, borderRadius:22,
            background: spread>=pages.length-1 ? 'rgba(201,168,76,0.08)' : 'rgba(201,168,76,0.18)',
            border:'1px solid rgba(201,168,76,0.3)', color:'#c9a84c',
            fontSize:18, cursor: spread>=pages.length-1?'not-allowed':'pointer',
            opacity: spread>=pages.length-1?0.3:1, transition:'all 0.2s',
            display:'flex', alignItems:'center', justifyContent:'center',
            touchAction:'manipulation',
          }}>▶</button>
        </div>
      </div>
    );
  }

  /* ══ DESKTOP ══ */
  const leftPage  = pages[spread*2]   || null;
  const rightPage = pages[spread*2+1] || null;
  const totalSpreads = Math.ceil(pages.length/2);

  return (
    <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:16 }}>
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{
          position:'relative',
          display:'flex',
          height: 480,
          borderRadius:'6px 18px 18px 6px',
          boxShadow:'0 30px 70px rgba(0,0,0,0.7),0 10px 25px rgba(0,0,0,0.4)',
          transformStyle:'preserve-3d',
          perspective:'1500px',
        }}>

        {/* Page gauche */}
        <div style={{ flex:1, position:'relative', borderRadius:'6px 0 0 6px', overflow:'hidden',
          boxShadow:'inset 3px 0 10px rgba(0,0,0,0.12)' }}>
          {leftPage
            ? <PageContent produits={leftPage.produits} categorie={leftPage.categorie}
                pageNum={spread*2+1} totalPages={pages.length}
                onAdd={onAdd} lang={lang} side="left" isMobile={false} />
            : <div style={{ width:'100%',height:'100%',background:'linear-gradient(to left,#e8dcc8,#f5efe0)' }} />}
        </div>

        {/* Reliure */}
        <div style={{
          width:22, flexShrink:0,
          background:'linear-gradient(to right,#100600,#3a1800,#100600)',
          boxShadow:'0 0 18px rgba(0,0,0,0.5)', zIndex:5,
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{ width:1.5, height:'65%',
            background:'linear-gradient(to bottom,transparent,rgba(201,168,76,0.35),transparent)' }} />
        </div>

        {/* Page droite */}
        <div style={{ flex:1, position:'relative', borderRadius:'0 18px 18px 0', overflow:'hidden',
          boxShadow:'inset -3px 0 10px rgba(0,0,0,0.08)' }}>
          {rightPage
            ? <PageContent produits={rightPage.produits} categorie={rightPage.categorie}
                pageNum={spread*2+2} totalPages={pages.length}
                onAdd={onAdd} lang={lang} side="right" isMobile={false} />
            : <div style={{ width:'100%',height:'100%',background:'linear-gradient(to right,#e8dcc8,#f5efe0)' }} />}
        </div>

        {/* Flip animé */}
        <FlippingPage
          flipping={flipping} flipDir={flipDir}
          fromPage={flipDir==='next' ? rightPage : leftPage}
          toPage={flipDir==='next' ? pages[nextSpread*2]||null : pages[nextSpread*2+1]||null}
          onAdd={onAdd} lang={lang} totalPages={pages.length}
          spreadIndex={spread} isMobile={false}
        />

        {/* Tranche */}
        <div style={{
          position:'absolute', right:-9, top:3, bottom:3, width:9,
          background:'repeating-linear-gradient(to bottom,#f5efe0 0,#f5efe0 2px,#d8ccb0 2px,#d8ccb0 4px)',
          borderRadius:'0 2px 2px 0', boxShadow:'3px 0 8px rgba(0,0,0,0.3)',
        }} />
      </div>

      {/* Nav desktop */}
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:20 }}>
        <button onClick={() => flip('prev')} disabled={spread<=0||flipping} style={{
          background:'transparent', border:'1px solid rgba(201,168,76,0.3)',
          color:'#c9a84c', borderRadius:8, padding:'8px 20px', fontSize:13,
          fontFamily:"'Cormorant Garamond',serif", fontWeight:600, letterSpacing:'1px',
          cursor: spread<=0?'not-allowed':'pointer', opacity: spread<=0?0.3:1, transition:'all 0.2s',
        }}>◀ {lang==='en'?'Previous':'Précédent'}</button>

        <span style={{
          fontFamily:"'Cormorant Garamond',serif", fontSize:13,
          color:'rgba(201,168,76,0.45)', fontStyle:'italic', letterSpacing:'1px',
        }}>{spread+1} / {totalSpreads}</span>

        <button onClick={() => flip('next')} disabled={spread>=totalSpreads-1||flipping} style={{
          background:'transparent', border:'1px solid rgba(201,168,76,0.3)',
          color:'#c9a84c', borderRadius:8, padding:'8px 20px', fontSize:13,
          fontFamily:"'Cormorant Garamond',serif", fontWeight:600, letterSpacing:'1px',
          cursor: spread>=totalSpreads-1?'not-allowed':'pointer',
          opacity: spread>=totalSpreads-1?0.3:1, transition:'all 0.2s',
        }}>{lang==='en'?'Next':'Suivant'} ▶</button>
      </div>
    </div>
  );
}

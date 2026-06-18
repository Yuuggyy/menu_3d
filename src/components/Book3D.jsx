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
        display: 'flex', gap: 8, padding: isMobile ? '7px 2px' : '9px 0',
        borderBottom: '1px solid rgba(80,50,30,0.2)',
        alignItems: 'center',
        borderRadius: 6,
        background: hovered ? 'rgba(196,98,45,0.07)' : 'transparent',
        transform: hovered ? 'translateY(-1px)' : 'none',
        boxShadow: hovered ? '0 4px 14px rgba(196,98,45,0.12)' : 'none',
        transition: 'all 0.22s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
      {/* Image */}
      <div style={{
        width: isMobile ? 42 : 50, height: isMobile ? 42 : 50,
        borderRadius: 7, flexShrink: 0,
        background: 'rgba(80,50,30,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        border: hovered ? '1px solid rgba(196,98,45,0.4)' : '1px solid transparent',
        transition: 'border 0.2s',
      }}>
        {produit.image_url
          ? <img src={produit.image_url} alt={produit.nom} style={{
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
          fontSize: isMobile ? 12 : 13, fontWeight: 700, color: '#1A1917',
          lineHeight: 1.3, marginBottom: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{produit.nom}</p>
        {produit.description && !isMobile && (
          <p style={{
            fontSize: 10, color: '#7A5A4A', lineHeight: 1.35, marginBottom: 2,
            fontStyle: 'italic', fontFamily: "'Cormorant Garamond',serif",
          }}>
            {produit.description.length > 46 ? produit.description.slice(0,46)+'…' : produit.description}
          </p>
        )}
        <p style={{
          fontFamily: "'Cormorant Garamond',serif",
          fontSize: isMobile ? 13 : 15, fontWeight: 700, color: '#C4622D',
        }}>
          {Number(produit.prix).toFixed(2)}
          <span style={{ fontSize: 9, fontWeight: 400, color: '#A07050' }}> €</span>
        </p>
      </div>

      {/* Qty + ajout */}
      <div style={{ display:'flex', flexDirection:'column', gap:4, alignItems:'center', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <button onClick={() => setQty(q => Math.max(0,q-1))} style={{
            width: isMobile?24:22, height: isMobile?24:22, borderRadius:'50%',
            border:'1.5px solid #C4622D', background:'transparent', color:'#C4622D',
            fontSize:14, fontWeight:700, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            touchAction:'manipulation',
          }}>−</button>
          <span style={{ fontSize:12, fontWeight:700, color:'#1A1917', minWidth:16, textAlign:'center' }}>{qty}</span>
          <button onClick={() => setQty(q => q+1)} style={{
            width: isMobile?24:22, height: isMobile?24:22, borderRadius:'50%',
            border:'none', background:'linear-gradient(135deg,#C4622D,#D4724A)',
            color:'white', fontSize:14, fontWeight:700, cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 6px rgba(196,98,45,0.3)', touchAction:'manipulation',
          }}>+</button>
        </div>
        {qty > 0 && (
          <button onClick={handleAdd} style={{
            background:'linear-gradient(135deg,#C4622D,#D4724A)',
            color:'white', border:'none', borderRadius:5,
            padding:'3px 7px', fontSize:9, fontWeight:700,
            cursor:'pointer', whiteSpace:'nowrap', touchAction:'manipulation',
            boxShadow:'0 2px 7px rgba(196,98,45,0.4)',
          }}>✓ {L.add}</button>
        )}
      </div>
    </div>
  );
}

/* ─── Filet décoratif ─── */
function GoldLine({ small }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:6, margin: small?'3px 0 5px':'5px 0 9px' }}>
      <div style={{ flex:1, height:1, background:'linear-gradient(to right,transparent,rgba(196,98,45,0.35))' }} />
      <span style={{ fontSize:8, color:'rgba(196,98,45,0.5)', letterSpacing:2 }}>✦</span>
      <div style={{ flex:1, height:1, background:'linear-gradient(to left,transparent,rgba(196,98,45,0.35))' }} />
    </div>
  );
}

/* ─── Contenu d'une face de page ─── */
function PageContent({ produits, categorie, pageNum, totalPages, onAdd, lang, side, isMobile }) {
  return (
    <div style={{
      width:'100%', height:'100%',
      background: side === 'left'
        ? 'linear-gradient(to left,#E8DCC8,#F5EFE0)'
        : 'linear-gradient(to right,#E8DCC8,#F5EFE0)',
      padding: isMobile ? '10px 8px 6px' : '18px 14px 10px',
      display:'flex', flexDirection:'column',
      position:'relative', overflow:'hidden',
      boxShadow: side === 'left'
        ? 'inset -6px 0 18px rgba(0,0,0,0.1)'
        : 'inset 6px 0 18px rgba(0,0,0,0.1)',
    }}>
      {/* Lignes papier */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage:'repeating-linear-gradient(transparent,transparent 25px,rgba(80,50,30,0.06) 25px,rgba(80,50,30,0.06) 26px)',
        backgroundPositionY:'42px',
      }} />

      {/* En-tête catégorie */}
      {categorie && (
        <>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2, position:'relative' }}>
            <span style={{ fontSize: isMobile?12:15 }}>{categorie.emoji||'🍽️'}</span>
            <span style={{
              fontFamily:"'Cormorant Garamond','Playfair Display',serif",
              fontSize: isMobile?13:16, fontWeight:700, color:'#C4622D', letterSpacing:'0.3px',
            }}>{categorie.nom}</span>
          </div>
          <GoldLine small={isMobile} />
        </>
      )}

      {/* Produits */}
      <div style={{ flex:1, overflow:'hidden', position:'relative' }}>
        {produits.map(p => (
          <ProduitCard key={p.id} produit={p} onAdd={onAdd} lang={lang} isMobile={isMobile} />
        ))}
      </div>

      {/* Numéro de page */}
      <p style={{
        textAlign: side==='left'?'left':'right',
        fontSize:9, color:'rgba(80,50,30,0.3)',
        fontStyle:'italic', marginTop:4,
        fontFamily:"'Cormorant Garamond',serif",
        letterSpacing:'1px', position:'relative',
      }}>{pageNum} / {totalPages}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LA PAGE QUI TOURNE — animation flip 3D réelle

   Principe :
   - next : la page DROITE pivote 0→-180° sur axe gauche
   - prev : la page GAUCHE pivote 0→+180° sur axe droit
   Face avant = page qui part / Face arrière = page qui arrive (miroir)
───────────────────────────────────────────── */
function FlippingPage({ flipping, flipDir, fromPage, toPage, onAdd, lang, totalPages, spreadIndex, isMobile }) {
  if (!flipping) return null;

  const isNext    = flipDir === 'next';
  const origin    = isNext ? 'left center' : 'right center';
  const endAngle  = isNext ? -180 : 180;

  return (
    <div style={{
      position:'absolute', top:0, bottom:0,
      left:  isNext ? '50%' : 0,
      right: isNext ? 0     : '50%',
      transformOrigin: origin,
      transformStyle:'preserve-3d',
      animation:'pageFlip 0.7s cubic-bezier(0.645,0.045,0.355,1.000) forwards',
      zIndex:20,
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
        position:'absolute', inset:0,
        backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
        overflow:'hidden',
      }}>
        {fromPage
          ? <PageContent produits={fromPage.produits} categorie={fromPage.categorie}
              pageNum={isNext ? spreadIndex*2+2 : spreadIndex*2+1}
              totalPages={totalPages} onAdd={onAdd} lang={lang}
              side={isNext?'right':'left'} isMobile={isMobile} />
          : <div style={{ width:'100%',height:'100%',background:'#F5EFE0' }} />}
      </div>

      {/* Face ARRIÈRE — page qui arrive (miroir horizontal) */}
      <div style={{
        position:'absolute', inset:0,
        backfaceVisibility:'hidden', WebkitBackfaceVisibility:'hidden',
        transform:'rotateY(180deg) scaleX(-1)',
        overflow:'hidden',
        boxShadow: isNext
          ? 'inset -12px 0 30px rgba(0,0,0,0.22)'
          : 'inset 12px 0 30px rgba(0,0,0,0.22)',
      }}>
        {toPage
          ? <PageContent produits={toPage.produits} categorie={toPage.categorie}
              pageNum={isNext ? spreadIndex*2+3 : spreadIndex*2}
              totalPages={totalPages} onAdd={onAdd} lang={lang}
              side={isNext?'left':'right'} isMobile={isMobile} />
          : <div style={{ width:'100%',height:'100%',background:'#EDE5CF' }} />}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   Book3D — composant principal
═══════════════════════════════════════ */
export default function Book3D({ pages, onAdd, lang, isMobile }) {
  const [spread, setSpread]         = useState(0);
  const [flipping, setFlipping]     = useState(false);
  const [flipDir, setFlipDir]       = useState(null);
  const [nextSpread, setNextSpread] = useState(0);

  const totalSpreads = isMobile ? pages.length : Math.ceil(pages.length / 2);

  const leftPage  = pages[spread*2]   || null;
  const rightPage = pages[spread*2+1] || null;

  const flip = useCallback((dir) => {
    if (flipping) return;
    if (dir === 'next' && spread >= totalSpreads-1) return;
    if (dir === 'prev' && spread <= 0) return;
    const next = dir === 'next' ? spread+1 : spread-1;
    setFlipDir(dir); setNextSpread(next); setFlipping(true);
    setTimeout(() => { setSpread(next); setFlipping(false); setFlipDir(null); }, 700);
  }, [flipping, spread, totalSpreads]);

  const touchStart = useRef(null);
  const onTouchStart = e => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = e => {
    if (!touchStart.current) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 45) flip(diff > 0 ? 'next' : 'prev');
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

  /* Pages du spread qui arrive (visibles derrière pendant le flip) */
  const nextLeftPage  = pages[nextSpread*2]   || null;
  const nextRightPage = pages[nextSpread*2+1] || null;

  /* La page qui tourne physiquement */
  const flippingFromPage = flipDir === 'next' ? rightPage    : leftPage;
  const flippingToPage   = flipDir === 'next' ? nextLeftPage : nextRightPage;

  /* ══ MOBILE : 1 page à la fois ══ */
  if (isMobile) {
    const page = pages[spread] || null;
    return (
      <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:12 }}>
        <div
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={{
            width:'100%',
            minHeight:'calc(100dvh - 180px)',
            background:'linear-gradient(135deg,#F5EFE0 0%,#EDE5CF 100%)',
            borderRadius:14,
            boxShadow:'0 18px 48px rgba(0,0,0,0.65), 4px 0 0 #CCC0A0, 7px 0 0 #BFB090',
            padding:'14px 12px 10px',
            position:'relative', overflow:'hidden',
            display:'flex', flexDirection:'column',
          }}>
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none',
            backgroundImage:'repeating-linear-gradient(transparent,transparent 25px,rgba(80,50,30,0.06) 25px,rgba(80,50,30,0.06) 26px)',
            backgroundPositionY:'40px',
          }} />
          {page && (
            <>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2, position:'relative' }}>
                <span style={{ fontSize:14 }}>{page.categorie?.emoji||'🍽️'}</span>
                <span style={{
                  fontFamily:"'Cormorant Garamond','Playfair Display',serif",
                  fontSize:15, fontWeight:700, color:'#C4622D',
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
          <p style={{
            textAlign:'right', fontSize:9, color:'rgba(80,50,30,0.3)',
            fontStyle:'italic', marginTop:4,
            fontFamily:"'Cormorant Garamond',serif", position:'relative',
          }}>{spread+1} / {pages.length}</p>
        </div>

        {/* Nav mobile */}
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:14 }}>
          <button onClick={() => flip('prev')} disabled={spread<=0||flipping} style={{
            width:44, height:44, borderRadius:'50%',
            background: spread<=0 ? 'rgba(196,98,45,0.07)' : 'linear-gradient(135deg,#C4622D,#D4724A)',
            border:'none', color: spread<=0 ? 'rgba(196,98,45,0.3)' : 'white',
            fontSize:22, cursor: spread<=0?'not-allowed':'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: spread<=0 ? 'none' : '0 4px 15px rgba(196,98,45,0.4)',
            transition:'all 0.2s', touchAction:'manipulation',
          }}>‹</button>

          <div style={{ display:'flex', gap:6 }}>
            {Array.from({ length: Math.min(pages.length,8) }).map((_,i) => {
              const idx    = pages.length<=8 ? i : Math.round(i*(pages.length-1)/7);
              const active = pages.length<=8 ? i===spread : Math.round(spread*7/(pages.length-1))===i;
              return (
                <div key={i} style={{
                  width: active?22:7, height:7, borderRadius:4,
                  background: active?'#C4622D':'rgba(196,98,45,0.2)',
                  transition:'all 0.3s ease', cursor:'pointer',
                }} />
              );
            })}
          </div>

          <button onClick={() => flip('next')} disabled={spread>=pages.length-1||flipping} style={{
            width:44, height:44, borderRadius:'50%',
            background: spread>=pages.length-1 ? 'rgba(196,98,45,0.07)' : 'linear-gradient(135deg,#C4622D,#D4724A)',
            border:'none', color: spread>=pages.length-1 ? 'rgba(196,98,45,0.3)' : 'white',
            fontSize:22, cursor: spread>=pages.length-1?'not-allowed':'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow: spread>=pages.length-1 ? 'none' : '0 4px 15px rgba(196,98,45,0.4)',
            transition:'all 0.2s', touchAction:'manipulation',
          }}>›</button>
        </div>
      </div>
    );
  }

  /* ══ DESKTOP : double page + flip 3D réel ══ */
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20 }}>

      {/* LE LIVRE — perspective sur le wrapper pour que le 3D soit visible */}
      <div
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        style={{ width:'100%', maxWidth:840, perspective:'2500px', userSelect:'none' }}
      >
        <div style={{
          display:'flex', height:530, position:'relative',
          boxShadow:'0 35px 90px rgba(0,0,0,0.85), 0 12px 35px rgba(0,0,0,0.5)',
          borderRadius:'6px 16px 16px 6px',
          transformStyle:'preserve-3d',
        }}>

          {/* Reliure centrale */}
          <div style={{
            position:'absolute', left:'50%', top:0, bottom:0, width:12,
            transform:'translateX(-50%)',
            background:'linear-gradient(to right,#1C1208,#4A2010,#1C1208)',
            zIndex:15, boxShadow:'0 0 20px rgba(0,0,0,0.7)',
          }} />

          {/* Page GAUCHE statique — cachée quand c'est elle qui tourne (prev) */}
          <div style={{
            flex:1, overflow:'hidden', borderRadius:'6px 0 0 6px',
            opacity: flipping && flipDir==='prev' ? 0 : 1,
          }}>
            {leftPage
              ? <PageContent produits={leftPage.produits} categorie={leftPage.categorie}
                  pageNum={spread*2+1} totalPages={pages.length}
                  onAdd={onAdd} lang={lang} side="left" isMobile={false} />
              : <div style={{ width:'100%',height:'100%',background:'linear-gradient(to left,#E8DCC8,#F5EFE0)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'rgba(80,50,30,0.15)', fontSize:42 }}>✦</span>
                </div>}
          </div>

          {/* Page DROITE statique — cachée quand c'est elle qui tourne (next) */}
          <div style={{
            flex:1, overflow:'hidden', borderRadius:'0 8px 8px 0',
            opacity: flipping && flipDir==='next' ? 0 : 1,
          }}>
            {rightPage
              ? <PageContent produits={rightPage.produits} categorie={rightPage.categorie}
                  pageNum={spread*2+2} totalPages={pages.length}
                  onAdd={onAdd} lang={lang} side="right" isMobile={false} />
              : <div style={{ width:'100%',height:'100%',background:'linear-gradient(to right,#E8DCC8,#F5EFE0)',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <span style={{ color:'rgba(80,50,30,0.15)', fontSize:42 }}>✦</span>
                </div>}
          </div>

          {/* Pages du spread SUIVANT — visibles derrière pendant le flip */}
          {flipping && (
            <>
              {flipDir==='next' && nextLeftPage && (
                <div style={{ position:'absolute', left:0, top:0, bottom:0, width:'50%',
                  overflow:'hidden', borderRadius:'6px 0 0 6px', zIndex:5 }}>
                  <PageContent produits={nextLeftPage.produits} categorie={nextLeftPage.categorie}
                    pageNum={nextSpread*2+1} totalPages={pages.length}
                    onAdd={onAdd} lang={lang} side="left" isMobile={false} />
                </div>
              )}
              {flipDir==='prev' && nextRightPage && (
                <div style={{ position:'absolute', right:0, top:0, bottom:0, width:'50%',
                  overflow:'hidden', borderRadius:'0 8px 8px 0', zIndex:5 }}>
                  <PageContent produits={nextRightPage.produits} categorie={nextRightPage.categorie}
                    pageNum={nextSpread*2+2} totalPages={pages.length}
                    onAdd={onAdd} lang={lang} side="right" isMobile={false} />
                </div>
              )}
            </>
          )}

          {/* LA PAGE QUI TOURNE EN 3D */}
          <FlippingPage
            flipping={flipping} flipDir={flipDir}
            fromPage={flippingFromPage} toPage={flippingToPage}
            onAdd={onAdd} lang={lang}
            totalPages={pages.length} spreadIndex={spread}
            isMobile={false}
          />

          {/* Ombre portée */}
          <div style={{
            position:'absolute', bottom:-18, left:'5%', right:'5%', height:18,
            background:'radial-gradient(ellipse,rgba(0,0,0,0.5) 0%,transparent 70%)',
            filter:'blur(7px)', zIndex:-1,
          }} />

          {/* Tranche pages droite */}
          <div style={{
            position:'absolute', right:-8, top:3, bottom:3, width:8,
            background:'repeating-linear-gradient(to bottom,#F5EFE0 0,#F5EFE0 2px,#D9CEBC 2px,#D9CEBC 4px)',
            borderRadius:'0 2px 2px 0', boxShadow:'3px 0 8px rgba(0,0,0,0.3)',
          }} />
        </div>
      </div>

      {/* Navigation desktop */}
      <div style={{ display:'flex', alignItems:'center', gap:20 }}>
        <button onClick={() => flip('prev')} disabled={spread===0||flipping} style={{
          width:46, height:46, borderRadius:'50%',
          background: spread===0 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#C4622D,#D4724A)',
          border:'none',
          color: spread===0 ? 'rgba(255,255,255,0.15)' : 'white',
          fontSize:22, cursor: spread===0?'not-allowed':'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: spread===0 ? 'none' : '0 4px 15px rgba(196,98,45,0.4)',
          transition:'all 0.2s',
        }}>‹</button>

        <div style={{ display:'flex', gap:7 }}>
          {Array.from({ length: totalSpreads }).map((_,i) => (
            <div key={i} onClick={() => !flipping && setSpread(i)} style={{
              width: i===spread?22:7, height:7, borderRadius:4,
              background: i===spread ? '#C4622D' : 'rgba(196,98,45,0.2)',
              transition:'all 0.3s', cursor:'pointer',
            }} />
          ))}
        </div>

        <button onClick={() => flip('next')} disabled={spread>=totalSpreads-1||flipping} style={{
          width:46, height:46, borderRadius:'50%',
          background: spread>=totalSpreads-1 ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#C4622D,#D4724A)',
          border:'none',
          color: spread>=totalSpreads-1 ? 'rgba(255,255,255,0.15)' : 'white',
          fontSize:22, cursor: spread>=totalSpreads-1?'not-allowed':'pointer',
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow: spread>=totalSpreads-1 ? 'none' : '0 4px 15px rgba(196,98,45,0.4)',
          transition:'all 0.2s',
        }}>›</button>
      </div>

      <p style={{ fontSize:11, color:'rgba(196,98,45,0.35)', fontStyle:'italic', fontFamily:"'Cormorant Garamond',serif" }}>
        ← Glissez ou utilisez les flèches →
      </p>
    </div>
  );
}

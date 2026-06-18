import { useState, useEffect } from 'react';
import { getCategories, getProduits, appelServeur } from '../lib/supabase';
import Book3D from '../components/Book3D';
import BookCover from '../components/BookCover';
import Panier from '../components/Panier';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return isMobile;
}

const ITEMS_PER_PAGE_MOBILE  = 3;
const ITEMS_PER_PAGE_DESKTOP = 4;

const T = {
  fr: {
    titre: 'Notre Menu', chargement: 'Chargement…',
    panier: 'Commande', appelServeurFull: '🔔 Appeler le serveur',
    tableModal: 'Votre numéro de table ?', tablePh: 'Ex: 5, Bar, Terrasse…',
    envoyer: 'Appeler', annuler: 'Annuler',
    appelOk: '🔔 Le serveur arrive !', errTable: 'Indiquez votre numéro de table.',
  },
  en: {
    titre: 'Our Menu', chargement: 'Loading…',
    panier: 'Order', appelServeurFull: '🔔 Call waiter',
    tableModal: 'Your table number?', tablePh: 'e.g. 5, Bar, Terrace…',
    envoyer: 'Call', annuler: 'Cancel',
    appelOk: '🔔 Waiter is coming!', errTable: 'Please enter your table number.',
  },
};

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [produits, setProduits]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [lang, setLang]             = useState('fr');
  const [panier, setPanier]         = useState([]);
  const [showPanier, setShowPanier] = useState(false);
  const [showAppel, setShowAppel]   = useState(false);
  const [tableAppel, setTableAppel] = useState('');
  const [errAppel, setErrAppel]     = useState('');
  const [toast, setToast]           = useState('');
  const [appelLoading, setAppelLoading] = useState(false);
  const [coverOpen, setCoverOpen]   = useState(false);

  const isMobile = useIsMobile();
  const L = T[lang];
  const ITEMS_PER_PAGE = isMobile ? ITEMS_PER_PAGE_MOBILE : ITEMS_PER_PAGE_DESKTOP;

  useEffect(() => {
    Promise.all([getCategories(), getProduits()]).then(([cats, prods]) => {
      setCategories(cats.data || []);
      setProduits(prods.data || []);
      setLoading(false);
    });
  }, []);

  const buildPages = () => {
    const pages = [];
    categories.forEach(cat => {
      const catProds = produits.filter(p => p.categorie_id === cat.id);
      if (!catProds.length) return;
      for (let i = 0; i < catProds.length; i += ITEMS_PER_PAGE)
        pages.push({ categorie: cat, produits: catProds.slice(i, i + ITEMS_PER_PAGE) });
    });
    const sansCat = produits.filter(p => !p.categorie_id);
    if (sansCat.length > 0)
      for (let i = 0; i < sansCat.length; i += ITEMS_PER_PAGE)
        pages.push({ categorie: { nom: 'Autres', emoji: '🍽️' }, produits: sansCat.slice(i, i + ITEMS_PER_PAGE) });
    return pages;
  };

  const handleAdd = (produit) => {
    setPanier(prev => {
      const idx = prev.findIndex(i => i.id === produit.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantite: next[idx].quantite + produit.quantite };
        return next;
      }
      return [...prev, { ...produit }];
    });
    showToast('✓ ' + produit.nom + ' ajouté');
  };

  const handleUpdateQty = (idx, delta) => {
    setPanier(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], quantite: next[idx].quantite + delta };
      if (next[idx].quantite <= 0) next.splice(idx, 1);
      return next;
    });
  };

  const handleConfirm = (msg) => { setPanier([]); setShowPanier(false); showToast(msg); };

  const handleAppelServeur = async () => {
    if (!tableAppel.trim()) { setErrAppel(L.errTable); return; }
    setAppelLoading(true); setErrAppel('');
    await appelServeur(tableAppel.trim());
    setAppelLoading(false); setShowAppel(false); setTableAppel('');
    showToast(L.appelOk);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const pages = buildPages();
  const totalItems = panier.reduce((s, i) => s + i.quantite, 0);

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'radial-gradient(ellipse at top,#2a1505 0%,#0d0500 65%)',
      display: 'flex', flexDirection: 'column',
    }}>

      {/* ══ COUVERTURE (overlay, ne perturbe pas le layout) ══ */}
      <BookCover
        restaurantName="Notre Menu"
        onOpen={() => setCoverOpen(true)}
        lang={lang}
        visible={!coverOpen}
      />

      {/* ══ HEADER ══ */}
      <header style={{
        padding: isMobile ? '10px 14px' : '14px 28px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,5,0,0.9)',
        gap: 8,
      }}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond','Playfair Display',serif",
          fontSize: isMobile ? 17 : 24, fontWeight: 700,
          background: 'linear-gradient(135deg,#c9a84c,#e8d08a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '0.5px', whiteSpace: 'nowrap', flexShrink: 0,
        }}>✦ {L.titre}</h1>

        <div style={{ display:'flex', alignItems:'center', gap: isMobile?6:10 }}>
          {/* Langue */}
          <button onClick={() => setLang(l => l==='fr'?'en':'fr')} style={{
            background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)',
            color:'#c9a84c', borderRadius:8, padding: isMobile?'5px 9px':'7px 13px',
            fontSize: isMobile?11:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap',
          }}>{lang==='fr'?'🇬🇧':'🇫🇷'}</button>

          {/* Appel serveur */}
          <button onClick={() => setShowAppel(true)} style={{
            background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)',
            color:'#c9a84c', borderRadius:8, padding: isMobile?'5px 9px':'7px 13px',
            fontSize: isMobile?11:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap',
          }}>{isMobile?'🔔':L.appelServeurFull}</button>

          {/* Panier */}
          <button onClick={() => setShowPanier(true)} style={{
            background: totalItems>0
              ? 'linear-gradient(135deg,#c9a84c,#e8d08a)'
              : 'rgba(201,168,76,0.1)',
            border:'1px solid rgba(201,168,76,0.25)',
            color: totalItems>0?'#1a0a00':'#c9a84c',
            borderRadius:8, padding: isMobile?'5px 10px':'7px 15px',
            fontSize: isMobile?11:13, fontWeight:700, cursor:'pointer',
            display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap',
            boxShadow: totalItems>0?'0 3px 12px rgba(201,168,76,0.35)':'none',
          }}>
            🛒 {!isMobile && L.panier}
            {totalItems>0 && (
              <span style={{
                background:'#1a0a00', color:'#c9a84c', borderRadius:'50%',
                width: isMobile?18:22, height: isMobile?18:22,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize: isMobile?10:11, fontWeight:800,
              }}>{totalItems}</span>
            )}
          </button>
        </div>
      </header>

      {/* ══ CONTENU ══ */}
      <main style={{
        flex: 1,
        padding: isMobile ? '12px 8px 80px' : '24px 20px 60px',
        maxWidth: 900, width: '100%', margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'80px 0' }}>
            <div className="spinner" />
            <p style={{ color:'rgba(201,168,76,0.5)', fontSize:14 }}>{L.chargement}</p>
          </div>
        ) : (
          <Book3D pages={pages} onAdd={handleAdd} lang={lang} isMobile={isMobile} />
        )}
      </main>

      {/* ══ PANIER ══ */}
      {showPanier && (
        <Panier
          items={panier} onUpdateQty={handleUpdateQty}
          onRemove={idx => setPanier(prev => prev.filter((_,i)=>i!==idx))}
          onClose={() => setShowPanier(false)}
          onConfirm={handleConfirm}
          lang={lang} isMobile={isMobile}
        />
      )}

      {/* ══ MODAL APPEL SERVEUR ══ */}
      {showAppel && (
        <div className="modal-overlay" onClick={() => setShowAppel(false)}>
          <div className="modal" style={{ maxWidth: isMobile?'92vw':420 }} onClick={e=>e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:20 }}>
              <div style={{ fontSize: isMobile?40:48, marginBottom:10 }}>🔔</div>
              <h2 style={{
                fontFamily:"'Cormorant Garamond',serif",
                fontSize: isMobile?18:21, color:'#c9a84c', fontWeight:700,
              }}>{L.tableModal}</h2>
            </div>
            <div style={{ marginBottom:16 }}>
              <input className="input" value={tableAppel}
                onChange={e => { setTableAppel(e.target.value); setErrAppel(''); }}
                placeholder={L.tablePh}
                onKeyDown={e => e.key==='Enter' && handleAppelServeur()}
                autoFocus style={{ fontSize: isMobile?16:14 }}
              />
              {errAppel && <p style={{ color:'#ff7675', fontSize:12, marginTop:6 }}>⚠️ {errAppel}</p>}
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-dark" onClick={() => setShowAppel(false)}
                style={{ flex:1, padding: isMobile?'12px':'10px' }}>{L.annuler}</button>
              <button className="btn btn-gold" onClick={handleAppelServeur} disabled={appelLoading}
                style={{ flex:1, padding: isMobile?'12px':'10px' }}>
                {appelLoading ? '⏳' : '🔔 ' + L.envoyer}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast && (
        <div className="toast" style={{ fontSize: isMobile?13:14, maxWidth:'85vw' }}>
          {toast}
        </div>
      )}
    </div>
  );
}

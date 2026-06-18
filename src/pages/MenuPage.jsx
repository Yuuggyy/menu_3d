import { useState, useEffect } from 'react';
import { getCategories, getProduits, appelServeur } from '../lib/supabase';
import Book3D from '../components/Book3D';
import Panier from '../components/Panier';

const ITEMS_PER_PAGE = 4;

const T = {
  fr: {
    chargement: 'Chargement…',
    panier: 'Commande',
    appelServeur: 'Appeler',
    tableModal: 'Numéro de table',
    tablePh: 'Ex: 5, Bar, Terrasse…',
    envoyer: 'Appeler',
    annuler: 'Annuler',
    appelOk: '🔔 Le serveur arrive !',
    errTable: 'Indiquez votre table.',
  },
  en: {
    chargement: 'Loading…',
    panier: 'Order',
    appelServeur: 'Call',
    tableModal: 'Table number',
    tablePh: 'e.g. 5, Bar, Terrace…',
    envoyer: 'Call',
    annuler: 'Cancel',
    appelOk: '🔔 Waiter on the way!',
    errTable: 'Enter your table number.',
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
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 768);

  const L = T[lang];

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

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
      for (let i = 0; i < catProds.length; i += ITEMS_PER_PAGE) {
        pages.push({ categorie: cat, produits: catProds.slice(i, i + ITEMS_PER_PAGE) });
      }
    });
    const sansCat = produits.filter(p => !p.categorie_id);
    if (sansCat.length) {
      for (let i = 0; i < sansCat.length; i += ITEMS_PER_PAGE) {
        pages.push({ categorie: { nom: 'Autres', emoji: '🍽️' }, produits: sansCat.slice(i, i + ITEMS_PER_PAGE) });
      }
    }
    return pages;
  };

  const handleAdd = (produit) => {
    setPanier(prev => {
      const idx = prev.findIndex(i => i.id === produit.id);
      if (idx >= 0) {
        const n = [...prev]; n[idx] = { ...n[idx], quantite: n[idx].quantite + produit.quantite }; return n;
      }
      return [...prev, { ...produit }];
    });
    showToast(`✓ ${produit.nom}`);
  };

  const handleUpdateQty = (idx, delta) => {
    setPanier(prev => {
      const n = [...prev]; n[idx] = { ...n[idx], quantite: n[idx].quantite + delta };
      if (n[idx].quantite <= 0) n.splice(idx, 1);
      return n;
    });
  };

  const handleRemove   = (idx) => setPanier(prev => prev.filter((_, i) => i !== idx));
  const handleConfirm  = (msg) => { setPanier([]); setShowPanier(false); showToast(msg); };
  const showToast      = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3200); };

  const handleAppelServeur = async () => {
    if (!tableAppel.trim()) { setErrAppel(L.errTable); return; }
    setAppelLoading(true); setErrAppel('');
    await appelServeur(tableAppel.trim());
    setAppelLoading(false); setShowAppel(false); setTableAppel('');
    showToast(L.appelOk);
  };

  const pages      = buildPages();
  const totalItems = panier.reduce((s, i) => s + i.quantite, 0);

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0F0F0E',
      display: 'flex', flexDirection: 'column',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Inter:wght@400;500;600;700&display=swap');

        .malamu-header {
          background: rgba(15,15,14,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(196,98,45,0.15);
          position: sticky; top: 0; z-index: 100;
          padding: 0 20px;
          height: 64px;
          display: flex; align-items: center; justify-content: space-between;
        }

        .malamu-logo-text {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 26px; font-weight: 600; font-style: italic;
          color: #F5EFE0;
          letter-spacing: 1px;
          line-height: 1;
        }
        .malamu-logo-sub {
          font-family: 'Inter', sans-serif;
          font-size: 8px; font-weight: 600;
          color: rgba(196,98,45,0.7);
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-top: 1px;
        }

        .hdr-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 8px 14px; border-radius: 22px;
          border: 1px solid rgba(196,98,45,0.35);
          background: rgba(196,98,45,0.07);
          color: rgba(232,147,106,0.85);
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.22s ease;
          white-space: nowrap; outline: none;
          -webkit-tap-highlight-color: transparent;
        }
        .hdr-btn:hover {
          background: rgba(196,98,45,0.15);
          border-color: rgba(196,98,45,0.6);
          color: #F5EFE0;
        }
        .hdr-btn.active {
          background: linear-gradient(135deg, #C4622D, #D4724A);
          border-color: transparent;
          color: #FAF7F2;
          box-shadow: 0 4px 16px rgba(196,98,45,0.45);
        }

        .bell-btn {
          width: 38px; height: 38px; border-radius: 50%;
          border: 1px solid rgba(196,98,45,0.3);
          background: rgba(196,98,45,0.06);
          color: rgba(232,147,106,0.8);
          font-size: 16px; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s; outline: none;
          -webkit-tap-highlight-color: transparent;
        }
        .bell-btn:hover {
          background: rgba(196,98,45,0.15);
          border-color: rgba(196,98,45,0.6);
        }

        /* Loading */
        @keyframes malamu-spin { to { transform: rotate(360deg); } }
        .malamu-spinner {
          width: 36px; height: 36px;
          border: 3px solid rgba(196,98,45,0.12);
          border-top-color: #C4622D;
          border-radius: 50%;
          animation: malamu-spin 0.9s linear infinite;
        }

        /* Toast */
        @keyframes malamu-toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .malamu-toast {
          position: fixed; bottom: 28px; left: 50%;
          transform: translateX(-50%);
          background: rgba(25,22,20,0.96);
          border: 1px solid rgba(196,98,45,0.5);
          color: #F5EFE0;
          padding: 12px 24px; border-radius: 40px;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          z-index: 9999;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          animation: malamu-toast-in 0.35s cubic-bezier(0.34,1.56,0.64,1);
          white-space: nowrap;
          pointer-events: none;
        }

        /* Modal */
        @keyframes malamu-modal-in {
          from { opacity: 0; transform: scale(0.88) translateY(18px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .malamu-modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          z-index: 500;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
        }
        .malamu-modal {
          background: #1A1917;
          border: 1px solid rgba(196,98,45,0.25);
          border-radius: 20px;
          padding: 32px 28px;
          width: 100%; max-width: 420px;
          box-shadow: 0 28px 64px rgba(0,0,0,0.8);
          animation: malamu-modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        .malamu-input {
          width: 100%; padding: 13px 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(196,98,45,0.25);
          border-radius: 10px;
          color: #F5EFE0;
          font-family: 'Inter', sans-serif; font-size: 14px;
          outline: none; transition: border 0.2s;
          box-sizing: border-box;
        }
        .malamu-input:focus { border-color: #C4622D; background: rgba(196,98,45,0.05); }
        .malamu-input::placeholder { color: rgba(245,239,224,0.25); }

        .malamu-btn-primary {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #C4622D, #D4724A);
          border: none; border-radius: 12px;
          color: #FAF7F2;
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 700;
          cursor: pointer; letter-spacing: 0.5px;
          box-shadow: 0 5px 18px rgba(196,98,45,0.4);
          transition: all 0.2s; outline: none;
        }
        .malamu-btn-primary:hover { transform: translateY(-1.5px); box-shadow: 0 8px 24px rgba(196,98,45,0.55); }
        .malamu-btn-primary:disabled { opacity: 0.5; transform: none; cursor: not-allowed; }

        .malamu-btn-secondary {
          width: 100%; padding: 13px;
          background: transparent;
          border: 1px solid rgba(196,98,45,0.25);
          border-radius: 12px;
          color: rgba(232,147,106,0.7);
          font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
          cursor: pointer; outline: none; transition: all 0.2s;
        }
        .malamu-btn-secondary:hover { background: rgba(196,98,45,0.07); border-color: rgba(196,98,45,0.45); }
      `}</style>

      {/* ══ HEADER ══ */}
      <header className="malamu-header">
        {/* Logo */}
        <div>
          <div className="malamu-logo-text">Malamu</div>
          <div className="malamu-logo-sub">Resto · Bar · Expériences</div>
        </div>

        {/* Actions */}
        <div style={{ display:'flex', alignItems:'center', gap: isMobile ? 8 : 10 }}>
          {/* Langue */}
          <button className="hdr-btn" onClick={() => setLang(l => l==='fr'?'en':'fr')}
            style={{ padding: isMobile ? '7px 10px' : '8px 14px' }}>
            {lang==='fr' ? '🇬🇧' : '🇫🇷'}
            {!isMobile && <span>{lang==='fr'?'EN':'FR'}</span>}
          </button>

          {/* Bell */}
          <button className="bell-btn" onClick={() => setShowAppel(true)} title={L.appelServeur}>
            🔔
          </button>

          {/* Panier */}
          <button
            className={'hdr-btn' + (totalItems>0?' active':'')}
            onClick={() => setShowPanier(true)}
            style={{ gap: 7 }}>
            🛒
            {!isMobile && <span>{L.panier}</span>}
            {totalItems > 0 && (
              <span style={{
                background: 'rgba(255,255,255,0.25)',
                borderRadius:'50%', width:20, height:20,
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:10, fontWeight:800,
              }}>{totalItems}</span>
            )}
          </button>
        </div>
      </header>

      {/* ══ MAIN ══ */}
      <main style={{
        flex: 1,
        padding: isMobile ? '20px 14px 70px' : '36px 28px 60px',
        maxWidth: 920, margin: '0 auto', width: '100%',
        boxSizing: 'border-box',
      }}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18, padding:'100px 0' }}>
            <div className="malamu-spinner" />
            <p style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:16, fontStyle:'italic',
              color:'rgba(245,239,224,0.35)',
            }}>{L.chargement}</p>
          </div>
        ) : (
          <Book3D pages={pages} onAdd={handleAdd} lang={lang} isMobile={isMobile} />
        )}
      </main>

      {/* ══ PANIER ══ */}
      {showPanier && (
        <Panier
          items={panier}
          onUpdateQty={handleUpdateQty}
          onRemove={handleRemove}
          onClose={() => setShowPanier(false)}
          onConfirm={handleConfirm}
          lang={lang}
        />
      )}

      {/* ══ MODAL APPEL SERVEUR ══ */}
      {showAppel && (
        <div className="malamu-modal-overlay" onClick={() => setShowAppel(false)}>
          <div className="malamu-modal" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:28 }}>
              <div style={{ fontSize:44, marginBottom:10 }}>🔔</div>
              <p style={{
                fontFamily:"'Cormorant Garamond',serif",
                fontSize:22, fontWeight:600,
                color:'#F5EFE0', marginBottom:4,
              }}>{L.tableModal}</p>
              <p style={{ fontSize:12, color:'rgba(196,98,45,0.6)', letterSpacing:'1px' }}>
                MALAMU • KINSHASA
              </p>
            </div>
            <input className="malamu-input" value={tableAppel}
              onChange={e => { setTableAppel(e.target.value); setErrAppel(''); }}
              placeholder={L.tablePh}
              onKeyDown={e => e.key==='Enter' && handleAppelServeur()}
              autoFocus
              style={{ marginBottom: errAppel ? 6 : 16 }}
            />
            {errAppel && (
              <p style={{ color:'#ff7675', fontSize:12, marginBottom:12 }}>⚠ {errAppel}</p>
            )}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <button className="malamu-btn-primary" onClick={handleAppelServeur} disabled={appelLoading}>
                {appelLoading ? '…' : `🔔 ${L.envoyer}`}
              </button>
              <button className="malamu-btn-secondary" onClick={() => setShowAppel(false)}>
                {L.annuler}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast && <div className="malamu-toast">{toast}</div>}
    </div>
  );
}

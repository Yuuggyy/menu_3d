import { useState, useEffect } from 'react';
import { getCategories, getProduits, appelServeur } from '../lib/supabase';
import Book3D from '../components/Book3D';
import Panier from '../components/Panier';

const ITEMS_PER_PAGE = 4;

const T = {
  fr: {
    titre: 'Notre Menu', chargement: 'Chargement du menu…',
    panier: 'Ma commande', appelServeur: '🔔 Appeler le serveur',
    tableModal: 'Quel est votre numéro de table ?',
    tablePh: 'Ex: 5, Bar, Terrasse…',
    envoyer: 'Appeler', annuler: 'Annuler',
    appelOk: '🔔 Le serveur arrive à votre table !',
    errTable: 'Indiquez votre numéro de table.',
  },
  en: {
    titre: 'Our Menu', chargement: 'Loading menu…',
    panier: 'My order', appelServeur: '🔔 Call waiter',
    tableModal: 'What is your table number?',
    tablePh: 'e.g. 5, Bar, Terrace…',
    envoyer: 'Call', annuler: 'Cancel',
    appelOk: '🔔 The waiter is on their way!',
    errTable: 'Please enter your table number.',
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

  const L = T[lang];

  useEffect(() => {
    Promise.all([getCategories(), getProduits()]).then(([cats, prods]) => {
      setCategories(cats.data || []);
      setProduits(prods.data || []);
      setLoading(false);
    });
  }, []);

  // Construire les pages du livre : groupes de ITEMS_PER_PAGE produits par catégorie
  const buildPages = () => {
    const pages = [];
    categories.forEach(cat => {
      const catProds = produits.filter(p => p.categorie_id === cat.id);
      if (catProds.length === 0) return;
      for (let i = 0; i < catProds.length; i += ITEMS_PER_PAGE) {
        pages.push({
          categorie: cat,
          produits: catProds.slice(i, i + ITEMS_PER_PAGE),
        });
      }
    });
    // Produits sans catégorie
    const sansCat = produits.filter(p => !p.categorie_id);
    if (sansCat.length > 0) {
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
        const next = [...prev];
        next[idx] = { ...next[idx], quantite: next[idx].quantite + produit.quantite };
        return next;
      }
      return [...prev, { ...produit }];
    });
    showToast(`✓ ${produit.nom} ajouté`);
  };

  const handleUpdateQty = (idx, delta) => {
    setPanier(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], quantite: next[idx].quantite + delta };
      if (next[idx].quantite <= 0) next.splice(idx, 1);
      return next;
    });
  };

  const handleRemove = (idx) => {
    setPanier(prev => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = (msg) => {
    setPanier([]);
    setShowPanier(false);
    showToast(msg);
  };

  const handleAppelServeur = async () => {
    if (!tableAppel.trim()) { setErrAppel(L.errTable); return; }
    setAppelLoading(true); setErrAppel('');
    await appelServeur(tableAppel.trim());
    setAppelLoading(false);
    setShowAppel(false);
    setTableAppel('');
    showToast(L.appelOk);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  const pages = buildPages();
  const totalItems = panier.reduce((s, i) => s + i.quantite, 0);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at top, #2a1505 0%, #0d0500 60%)',
      padding: '0 0 60px',
    }}>
      {/* ── Header ── */}
      <header style={{
        padding: '20px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        backdropFilter: 'blur(10px)',
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(13,5,0,0.8)',
      }}>
        <div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24, fontWeight: 900,
            background: 'linear-gradient(135deg, #c9a84c, #e8d08a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.5px',
          }}>✦ {L.titre}</h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Langue */}
          <button onClick={() => setLang(l => l === 'fr' ? 'en' : 'fr')} style={{
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
            color: '#c9a84c', borderRadius: 8, padding: '6px 12px',
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>{lang === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}</button>

          {/* Appel serveur */}
          <button onClick={() => setShowAppel(true)} style={{
            background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.3)',
            color: '#c9a84c', borderRadius: 8, padding: '8px 14px',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>{L.appelServeur}</button>

          {/* Panier */}
          <button onClick={() => setShowPanier(true)} style={{
            background: totalItems > 0 ? 'linear-gradient(135deg, #c9a84c, #e8d08a)' : 'rgba(201,168,76,0.1)',
            border: '1px solid rgba(201,168,76,0.3)',
            color: totalItems > 0 ? '#1a0a00' : '#c9a84c',
            borderRadius: 8, padding: '8px 16px',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: totalItems > 0 ? '0 4px 15px rgba(201,168,76,0.4)' : 'none',
          }}>
            🛒 {L.panier}
            {totalItems > 0 && (
              <span style={{
                background: '#1a0a00', color: '#c9a84c',
                borderRadius: '50%', width: 22, height: 22,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 800,
              }}>{totalItems}</span>
            )}
          </button>
        </div>
      </header>

      {/* ── Contenu ── */}
      <main style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '80px 0' }}>
            <div className="spinner" />
            <p style={{ color: 'rgba(201,168,76,0.6)', fontSize: 15 }}>{L.chargement}</p>
          </div>
        ) : (
          <Book3D pages={pages} onAdd={handleAdd} lang={lang} />
        )}
      </main>

      {/* ── Modal Panier ── */}
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

      {/* ── Modal Appel Serveur ── */}
      {showAppel && (
        <div className="modal-overlay" onClick={() => setShowAppel(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, color: '#c9a84c' }}>
                {L.tableModal}
              </h2>
            </div>
            <div style={{ marginBottom: 16 }}>
              <input className="input" value={tableAppel}
                onChange={e => { setTableAppel(e.target.value); setErrAppel(''); }}
                placeholder={L.tablePh}
                onKeyDown={e => e.key === 'Enter' && handleAppelServeur()}
                autoFocus
              />
              {errAppel && <p style={{ color: '#ff7675', fontSize: 12, marginTop: 6 }}>⚠️ {errAppel}</p>}
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-dark" onClick={() => setShowAppel(false)} style={{ flex: 1 }}>
                {L.annuler}
              </button>
              <button className="btn btn-gold" onClick={handleAppelServeur} disabled={appelLoading} style={{ flex: 1 }}>
                {appelLoading ? '⏳…' : `🔔 ${L.envoyer}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

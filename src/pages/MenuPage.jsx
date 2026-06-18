import { useState, useEffect } from 'react';
import { getCategories, getProduits, appelServeur, createCommande } from '../lib/supabase';
import Book3D from '../components/Book3D';

const ITEMS_PER_PAGE = 4;

const T = {
  fr: { loading:'Chargement…', panier:'Commande', bell:'Appeler', tableQ:'Table ?', tablePh:'5, Bar, Terrasse…', send:'Appeler', cancel:'Annuler', bellOk:'🔔 Le serveur arrive !', errTable:'Indiquez votre table.', vide:'Votre panier est vide', total:'Total', table:'N° de table', demandes:'Demandes particulières', demandesPh:'Allergies, sans sel…', commander:'Passer la commande', cmdOk:'✅ Commande envoyée !' },
  en: { loading:'Loading…',   panier:'Order',    bell:'Call',    tableQ:'Table?', tablePh:'5, Bar, Terrace…',  send:'Call',   cancel:'Cancel', bellOk:'🔔 Waiter is on the way!', errTable:'Enter your table.', vide:'Your cart is empty', total:'Total', table:'Table number', demandes:'Special requests', demandesPh:'Allergies, no salt…', commander:'Place order', cmdOk:'✅ Order sent!' },
};

export default function MenuPage() {
  const [cats, setCats]         = useState([]);
  const [prods, setProds]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [lang, setLang]         = useState('fr');
  const [panier, setPanier]     = useState([]);
  const [showPanier, setShowPanier] = useState(false);
  const [showAppel, setShowAppel]   = useState(false);
  const [tableNum, setTableNum] = useState('');
  const [errTable, setErrTable] = useState('');
  const [toast, setToast]       = useState('');
  const [appLoading, setAppLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Panier form state
  const [pTable, setPTable]       = useState('');
  const [pDemandes, setPDemandes] = useState('');
  const [pErr, setPErr]           = useState('');
  const [pLoading, setPLoading]   = useState(false);
  const [stamped, setStamped]     = useState(false);

  const L = T[lang];

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);

  useEffect(() => {
    Promise.all([getCategories(), getProduits()]).then(([c, p]) => {
      setCats(c.data || []); setProds(p.data || []); setLoading(false);
    });
  }, []);

  const buildPages = () => {
    const pages = [];
    cats.forEach(cat => {
      const cp = prods.filter(p => p.categorie_id === cat.id);
      if (!cp.length) return;
      for (let i = 0; i < cp.length; i += ITEMS_PER_PAGE)
        pages.push({ categorie: cat, produits: cp.slice(i, i+ITEMS_PER_PAGE) });
    });
    const sans = prods.filter(p => !p.categorie_id);
    if (sans.length)
      for (let i = 0; i < sans.length; i += ITEMS_PER_PAGE)
        pages.push({ categorie: { nom:'Autres', emoji:'🍽️' }, produits: sans.slice(i, i+ITEMS_PER_PAGE) });
    return pages;
  };

  const doToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3200); };

  const addToCart = (prod) => {
    setPanier(prev => {
      const i = prev.findIndex(x => x.id === prod.id);
      if (i >= 0) { const n=[...prev]; n[i]={...n[i], quantite:n[i].quantite+prod.quantite}; return n; }
      return [...prev, prod];
    });
    doToast(`✓ ${prod.nom}`);
  };

  const updateQty = (idx, d) => {
    setPanier(prev => {
      const n=[...prev]; n[idx]={...n[idx], quantite:n[idx].quantite+d};
      if (n[idx].quantite<=0) n.splice(idx,1); return n;
    });
  };

  const callWaiter = async () => {
    if (!tableNum.trim()) { setErrTable(L.errTable); return; }
    setAppLoading(true); setErrTable('');
    await appelServeur(tableNum.trim());
    setAppLoading(false); setShowAppel(false); setTableNum('');
    doToast(L.bellOk);
  };

  

  const placeOrder = async () => {
    if (!pTable.trim()) { setPErr(L.errTable); return; }
    setPLoading(true); setPErr('');
    
    const { error } = await createCommande(pTable.trim(), panier, pDemandes.trim());
    setPLoading(false);
    if (error) { setPErr(error.message); return; }
    setStamped(true);
    setTimeout(() => { setPanier([]); setShowPanier(false); setStamped(false); setPTable(''); setPDemandes(''); doToast(L.cmdOk); }, 1400);
  };

  const pages = buildPages();
  const total = panier.reduce((s,i) => s+i.prix_unit*i.quantite, 0);
  const totalItems = panier.reduce((s,i) => s+i.quantite, 0);

  return (
    <div style={{ minHeight:'100dvh', background:'#0D0C0B', display:'flex', flexDirection:'column' }}>

      {/* ══ HEADER ══ */}
      <header className="menu-header">
        <div className="header-brand">
          <span className="header-name">Malamu</span>
          <span className="header-tagline">Resto · Bar · Expériences</span>
        </div>
        <div className="header-actions">
          <button className="hbtn" onClick={() => setLang(l => l==='fr'?'en':'fr')}>
            {lang==='fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
          </button>
          <button className="hbtn icon-only" onClick={() => setShowAppel(true)} title={L.bell}>🔔</button>
          <button className={`hbtn${totalItems>0?' cart-full':''}`} onClick={() => setShowPanier(true)}>
            🛒{!isMobile && ` ${L.panier}`}
            {totalItems>0 && <span className="cart-badge">{totalItems}</span>}
          </button>
        </div>
      </header>

      {/* ══ MAIN ══ */}
      <main style={{ flex:1, padding: isMobile ? '18px 12px 80px' : '32px 24px 60px', maxWidth:920, margin:'0 auto', width:'100%', boxSizing:'border-box' }}>
        {loading ? (
          <div className="loading-wrap">
            <div className="loading-spinner" />
            <p className="loading-text">{L.loading}</p>
          </div>
        ) : (
          <Book3D pages={pages} onAdd={addToCart} lang={lang} isMobile={isMobile} />
        )}
      </main>

      {/* ══ PANIER ══ */}
      {showPanier && (
        <div className="panier-overlay" onClick={() => setShowPanier(false)}>
          <div className="panier-sheet" onClick={e => e.stopPropagation()} style={{ position:'relative' }}>
            {stamped && (
              <div className="stamp-overlay">
                <div className="stamp-box">
                  <span className="stamp-icon">✅</span>
                  <span className="stamp-text">Envoyée</span>
                </div>
              </div>
            )}
            <div className="panier-handle"><div /></div>
            <div className="panier-head">
              <div>
                <div className="panier-title">🛒 {L.panier}</div>
                {panier.length>0 && <div className="panier-count">{totalItems} article{totalItems>1?'s':''}</div>}
              </div>
              <button className="close-btn" onClick={() => setShowPanier(false)}>✕</button>
            </div>
            <div className="panier-body">
              {panier.length === 0 ? (
                <div className="panier-empty"><div style={{fontSize:46,marginBottom:10}}>🛒</div><p>{L.vide}</p></div>
              ) : (
                <>
                  {panier.map((item, idx) => (
                    <div className="panier-item" key={idx}>
                      <div className="p-item-info">
                        <div className="p-item-name">{item.nom}</div>
                        <div className="p-item-price">{Number(item.prix_unit).toFixed(2)} $</div>
                      </div>
                      <button className="qty-btn-p" onClick={() => updateQty(idx,-1)}>−</button>
                      <span style={{fontSize:13,fontWeight:700,minWidth:16,textAlign:'center',color:'#F0EBE3'}}>{item.quantite}</span>
                      <button className="qty-btn-p plus" onClick={() => updateQty(idx,1)}>+</button>
                      <div className="p-item-sub">{(item.prix_unit*item.quantite).toFixed(2)} $</div>
                      <button className="p-item-del" onClick={() => setPanier(p => p.filter((_,i)=>i!==idx))}>🗑</button>
                    </div>
                  ))}
                  <div className="panier-total-row">
                    <span className="panier-total-label">{L.total}</span>
                    <span className="panier-total-val">{total.toFixed(2)} $</span>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:10,marginTop:16}}>
                    <div><span className="p-label">{L.table}</span>
                      <input className="p-input" value={pTable} onChange={e=>setPTable(e.target.value)} placeholder={L.tablePh} /></div>
                    <div><span className="p-label">{L.demandes}</span>
                      <textarea className="p-input" value={pDemandes} onChange={e=>setPDemandes(e.target.value)} placeholder={L.demandesPh} rows={2} style={{minHeight:58}} /></div>
                    {pErr && <div className="err-msg">⚠ {pErr}</div>}
                  </div>
                </>
              )}
            </div>
            {panier.length>0 && (
              <div className="panier-foot">
                <button className="order-btn" onClick={placeOrder} disabled={pLoading}>
                  {pLoading ? '…' : `✅ ${L.commander}`}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ MODAL APPEL ══ */}
      {showAppel && (
        <div className="modal-overlay" onClick={() => setShowAppel(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-icon">🔔</div>
            <div className="modal-title">{L.tableQ}</div>
            <div className="modal-sub">MALAMU · KINSHASA</div>
            <input className="p-input" value={tableNum} onChange={e=>{setTableNum(e.target.value);setErrTable('');}} placeholder={L.tablePh} onKeyDown={e=>e.key==='Enter'&&callWaiter()} autoFocus style={{marginBottom:errTable?6:14}} />
            {errTable && <div className="err-msg">⚠ {errTable}</div>}
            <div style={{marginBottom:errTable?0:0}}>
              <button className="modal-btn-p" onClick={callWaiter} disabled={appLoading}>{appLoading?'…':`🔔 ${L.send}`}</button>
              <button className="modal-btn-s" onClick={()=>setShowAppel(false)}>{L.cancel}</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ══ */}
      {toast && <div className="toast-bar">{toast}</div>}
    </div>
  );
}

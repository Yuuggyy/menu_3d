import { useState } from 'react';
import { createCommande } from '../lib/supabase';

const T = {
  fr: {
    titre: 'Ma Commande', vide: 'Votre panier est vide',
    table: 'Numéro de table', tablePh: 'Table 5, Bar, Terrasse…',
    demandes: 'Demandes particulières', demandesPh: 'Allergies, sans sel…',
    commander: 'Passer la commande', annuler: 'Fermer',
    total: 'Total', confirmation: '✅ Commande envoyée !',
    errTable: 'Indiquez votre numéro de table.',
  },
  en: {
    titre: 'My Order', vide: 'Your cart is empty',
    table: 'Table number', tablePh: 'Table 5, Bar, Terrace…',
    demandes: 'Special requests', demandesPh: 'Allergies, no salt…',
    commander: 'Place order', annuler: 'Close',
    total: 'Total', confirmation: '✅ Order sent!',
    errTable: 'Enter your table number.',
  },
};

export default function Panier({ items, onUpdateQty, onRemove, onClose, onConfirm, lang }) {
  const [table, setTable]       = useState('');
  const [demandes, setDemandes] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [stamped, setStamped]   = useState(false);
  const L = T[lang] || T.fr;

  const total = items.reduce((s, i) => s + i.prix_unit * i.quantite, 0);

  const handleSubmit = async () => {
    if (!table.trim()) { setError(L.errTable); return; }
    setLoading(true); setError('');
    const { error: err } = await createCommande(table.trim(), items, demandes.trim());
    setLoading(false);
    if (err) { setError(err.message); return; }
    setStamped(true);
    setTimeout(() => onConfirm(L.confirmation), 1400);
  };

  return (
    <div style={{
      position:'fixed', inset:0,
      background:'rgba(0,0,0,0.88)',
      backdropFilter:'blur(16px)',
      WebkitBackdropFilter:'blur(16px)',
      zIndex:500,
      display:'flex', alignItems:'flex-end',
      justifyContent:'center',
    }} onClick={onClose}>

      <style>{`
        @keyframes panier-slide-up {
          from { opacity: 0; transform: translateY(100%); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes stamp-appear {
          0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.3) rotate(-18deg); }
          60%  { opacity: 1; transform: translate(-50%,-50%) scale(1.08) rotate(-10deg); }
          100% { opacity: 1; transform: translate(-50%,-50%) scale(1) rotate(-8deg); }
        }
        .panier-scroll::-webkit-scrollbar { width: 4px; }
        .panier-scroll::-webkit-scrollbar-track { background: transparent; }
        .panier-scroll::-webkit-scrollbar-thumb { background: rgba(196,98,45,0.3); border-radius: 2px; }
        .item-label {
          font-family: 'Inter', sans-serif;
          font-size: 9px; font-weight: 700;
          color: rgba(196,98,45,0.65);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          margin-bottom: 5px;
          display: block;
        }
        .panier-input {
          width: 100%; padding: 12px 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(196,98,45,0.2);
          border-radius: 10px;
          color: #F5EFE0;
          font-family: 'Inter', sans-serif; font-size: 14px;
          outline: none; transition: border 0.2s; resize: vertical;
          box-sizing: border-box;
        }
        .panier-input:focus { border-color: #C4622D; background: rgba(196,98,45,0.04); }
        .panier-input::placeholder { color: rgba(245,239,224,0.2); }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:'#1A1917',
          borderTop:'1px solid rgba(196,98,45,0.2)',
          borderRadius:'24px 24px 0 0',
          width:'100%', maxWidth:520,
          maxHeight:'90dvh',
          display:'flex', flexDirection:'column',
          animation:'panier-slide-up 0.42s cubic-bezier(0.34,1.56,0.64,1)',
          position:'relative', overflow:'hidden',
        }}>

        {/* Stamp confirmation */}
        {stamped && (
          <div style={{
            position:'absolute', inset:0, zIndex:50,
            background:'rgba(15,15,14,0.6)',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            <div style={{
              position:'absolute', top:'50%', left:'50%',
              width:180, height:180,
              border:'5px solid #C4622D',
              borderRadius:8,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:6,
              transform:'translate(-50%,-50%) rotate(-8deg)',
              animation:'stamp-appear 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
              opacity:0,
              background:'rgba(15,15,14,0.85)',
            }}>
              <span style={{ fontSize:40 }}>✅</span>
              <span style={{
                fontFamily:"'Cormorant Garamond',serif",
                fontSize:18, fontWeight:700, color:'#C4622D',
                letterSpacing:2, textTransform:'uppercase',
              }}>Envoyée</span>
            </div>
          </div>
        )}

        {/* Drag handle */}
        <div style={{ padding:'14px 0 8px', display:'flex', justifyContent:'center', flexShrink:0 }}>
          <div style={{ width:38, height:4, borderRadius:2, background:'rgba(196,98,45,0.25)' }} />
        </div>

        {/* Header */}
        <div style={{
          padding:'0 22px 14px',
          display:'flex', justifyContent:'space-between', alignItems:'center',
          borderBottom:'1px solid rgba(196,98,45,0.1)',
          flexShrink:0,
        }}>
          <div>
            <p style={{
              fontFamily:"'Cormorant Garamond',serif",
              fontSize:22, fontWeight:600, color:'#F5EFE0',
            }}>🛒 {L.titre}</p>
            {items.length > 0 && (
              <p style={{ fontSize:11, color:'rgba(196,98,45,0.55)', marginTop:1, fontFamily:"'Inter',sans-serif" }}>
                {items.reduce((s,i)=>s+i.quantite,0)} article{items.reduce((s,i)=>s+i.quantite,0)>1?'s':''}
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            width:34, height:34, borderRadius:'50%',
            border:'1px solid rgba(196,98,45,0.2)',
            background:'rgba(196,98,45,0.07)',
            color:'rgba(245,239,224,0.5)',
            fontSize:16, cursor:'pointer', outline:'none',
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>✕</button>
        </div>

        {/* Corps scrollable */}
        <div className="panier-scroll" style={{
          flex:1, overflowY:'auto',
          padding:'16px 22px',
        }}>
          {items.length === 0 ? (
            <div style={{ textAlign:'center', padding:'50px 0', color:'rgba(245,239,224,0.2)' }}>
              <div style={{ fontSize:48, marginBottom:10 }}>🛒</div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:16, fontStyle:'italic' }}>{L.vide}</p>
            </div>
          ) : (
            <>
              {/* Articles */}
              {items.map((item, idx) => (
                <div key={idx} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'11px 0',
                  borderBottom:'1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{
                      fontFamily:"'Cormorant Garamond',serif",
                      fontSize:15, fontWeight:600, color:'#F5EFE0',
                      whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                    }}>{item.nom}</p>
                    <p style={{ fontSize:12, color:'#C4622D', fontFamily:"'Cormorant Garamond',serif" }}>
                      {Number(item.prix_unit).toFixed(2)} €
                    </p>
                  </div>
                  {/* Qty */}
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <button onClick={() => onUpdateQty(idx,-1)} style={{
                      width:28, height:28, borderRadius:'50%',
                      border:'1px solid rgba(196,98,45,0.3)',
                      background:'transparent', color:'#E8936A',
                      cursor:'pointer', fontSize:15, fontWeight:700,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      outline:'none', touchAction:'manipulation',
                    }}>−</button>
                    <span style={{ fontSize:14, fontWeight:700, minWidth:18, textAlign:'center', color:'#F5EFE0' }}>
                      {item.quantite}
                    </span>
                    <button onClick={() => onUpdateQty(idx,1)} style={{
                      width:28, height:28, borderRadius:'50%',
                      border:'none',
                      background:'linear-gradient(135deg,#C4622D,#D4724A)',
                      color:'white', cursor:'pointer', fontSize:15, fontWeight:700,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      boxShadow:'0 2px 7px rgba(196,98,45,0.4)',
                      outline:'none', touchAction:'manipulation',
                    }}>+</button>
                  </div>
                  {/* Sous-total */}
                  <p style={{
                    fontSize:14, fontWeight:700, color:'#F5EFE0',
                    minWidth:54, textAlign:'right',
                    fontFamily:"'Cormorant Garamond',serif",
                  }}>{(item.prix_unit * item.quantite).toFixed(2)} €</p>
                  {/* Suppr */}
                  <button onClick={() => onRemove(idx)} style={{
                    background:'none', border:'none',
                    color:'rgba(255,100,100,0.45)',
                    cursor:'pointer', fontSize:14, padding:'0 2px',
                    outline:'none', touchAction:'manipulation',
                  }}>🗑</button>
                </div>
              ))}

              {/* Total */}
              <div style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'14px 0 4px',
                borderTop:'1px solid rgba(196,98,45,0.25)',
                marginTop:4,
              }}>
                <span style={{
                  fontFamily:"'Cormorant Garamond',serif",
                  fontSize:16, fontWeight:600, color:'rgba(245,239,224,0.7)',
                }}>{L.total}</span>
                <span style={{
                  fontFamily:"'Cormorant Garamond',serif",
                  fontSize:22, fontWeight:700, color:'#C4622D',
                }}>{total.toFixed(2)} €</span>
              </div>

              {/* Formulaire */}
              <div style={{ display:'flex', flexDirection:'column', gap:12, marginTop:18 }}>
                <div>
                  <span className="item-label">{L.table}</span>
                  <input className="panier-input" value={table}
                    onChange={e => setTable(e.target.value)}
                    placeholder={L.tablePh} />
                </div>
                <div>
                  <span className="item-label">{L.demandes}</span>
                  <textarea className="panier-input" value={demandes}
                    onChange={e => setDemandes(e.target.value)}
                    placeholder={L.demandesPh} rows={2}
                    style={{ minHeight:64 }} />
                </div>
                {error && <p style={{ color:'#ff7675', fontSize:12 }}>⚠ {error}</p>}
              </div>
            </>
          )}
        </div>

        {/* Footer CTA */}
        {items.length > 0 && (
          <div style={{
            padding:'14px 22px 24px',
            borderTop:'1px solid rgba(196,98,45,0.1)',
            display:'flex', flexDirection:'column', gap:10,
            flexShrink:0,
          }}>
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width:'100%', padding:'15px',
                background:'linear-gradient(135deg,#C4622D,#D4724A)',
                border:'none', borderRadius:14,
                color:'#FAF7F2',
                fontFamily:"'Inter',sans-serif",
                fontSize:14, fontWeight:700,
                cursor: loading?'not-allowed':'pointer',
                opacity: loading?0.6:1,
                boxShadow:'0 6px 20px rgba(196,98,45,0.45)',
                transition:'all 0.2s', outline:'none',
                letterSpacing:'0.5px',
              }}>
              {loading ? '…' : `✅ ${L.commander}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

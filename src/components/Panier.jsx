import { useState } from 'react';
import { createCommande } from '../lib/supabase';

const T = {
  fr: {
    panier: 'Ma Commande', vide: 'Panier vide',
    table: 'Numéro de table *', tablePh: 'Ex: 5, Bar…',
    demandes: 'Demandes particulières', demandesPh: 'Allergies, sans sel…',
    commander: 'Commander', total: 'Total',
    confirmation: '✅ Commande envoyée !',
    errTable: 'Indiquez votre numéro de table.',
  },
  en: {
    panier: 'My Order', vide: 'Empty cart',
    table: 'Table number *', tablePh: 'e.g. 5, Bar…',
    demandes: 'Special requests', demandesPh: 'Allergies, no salt…',
    commander: 'Place order', total: 'Total',
    confirmation: '✅ Order sent!',
    errTable: 'Please enter your table number.',
  },
};

export default function Panier({ items, onUpdateQty, onRemove, onClose, onConfirm, lang, isMobile }) {
  const [table, setTable]       = useState('');
  const [demandes, setDemandes] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const L = T[lang] || T.fr;

  const total = items.reduce((s, i) => s + i.prix_unit * i.quantite, 0);

  const handleSubmit = async () => {
    if (!table.trim()) { setError(L.errTable); return; }
    setLoading(true); setError('');
    const { error: err } = await createCommande(table.trim(), items, demandes.trim());
    setLoading(false);
    if (err) { setError(err.message); return; }
    onConfirm(L.confirmation);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#1a0a00', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: isMobile ? '20px 20px 0 0' : 16,
          width: '100%',
          maxWidth: isMobile ? '100%' : 500,
          maxHeight: isMobile ? '92dvh' : '88vh',
          overflowY: 'auto',
          padding: isMobile ? '20px 16px 32px' : '28px 28px 28px',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.7)',
          // Sur mobile : ancré en bas
          ...(isMobile ? {
            position: 'fixed', bottom: 0, left: 0, right: 0,
            animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          } : {
            animation: 'modalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          }),
        }}
      >
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
          @keyframes modalIn {
            from { opacity:0; transform: scale(0.9) translateY(20px); }
            to   { opacity:1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* Barre de drag mobile */}
        {isMobile && (
          <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />
        )}

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h2 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: isMobile ? 19 : 22, color: '#c9a84c',
          }}>🛒 {L.panier}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
            fontSize: 22, cursor: 'pointer', touchAction: 'manipulation',
          }}>✕</button>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 44, marginBottom: 10 }}>🛒</div>
            <p style={{ fontSize: 14 }}>{L.vide}</p>
          </div>
        ) : (
          <>
            {/* Articles */}
            <div style={{ marginBottom: 16 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: isMobile ? '10px 0' : '11px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: isMobile ? 13 : 14, fontWeight: 600, color: '#f5efe0', marginBottom: 1,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nom}</p>
                    <p style={{ fontSize: 12, color: '#c9a84c' }}>{Number(item.prix_unit).toFixed(2)} €</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button onClick={() => onUpdateQty(idx, -1)} style={{
                      width: isMobile ? 30 : 27, height: isMobile ? 30 : 27, borderRadius: '50%',
                      border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                      color: 'white', cursor: 'pointer', fontSize: 16, touchAction: 'manipulation',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>−</button>
                    <span style={{ fontSize: 13, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{item.quantite}</span>
                    <button onClick={() => onUpdateQty(idx, 1)} style={{
                      width: isMobile ? 30 : 27, height: isMobile ? 30 : 27, borderRadius: '50%',
                      border: 'none', background: '#c9a84c', color: '#1a0a00',
                      cursor: 'pointer', fontSize: 16, touchAction: 'manipulation',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>+</button>
                    <button onClick={() => onRemove(idx)} style={{
                      background: 'none', border: 'none', color: 'rgba(255,100,100,0.6)',
                      cursor: 'pointer', fontSize: 16, padding: '0 2px', touchAction: 'manipulation',
                    }}>🗑️</button>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#f5efe0', minWidth: 52, textAlign: 'right' }}>
                    {(item.prix_unit * item.quantite).toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 0', marginBottom: 18,
              borderTop: '2px solid rgba(201,168,76,0.25)',
            }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#c9a84c' }}>{L.total}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#c9a84c' }}>{total.toFixed(2)} €</span>
            </div>

            {/* Formulaire */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="label">{L.table}</label>
                <input className="input" value={table} onChange={e => setTable(e.target.value)}
                  placeholder={L.tablePh}
                  style={{ fontSize: isMobile ? 16 : 14 }} /* 16px évite zoom iOS */
                />
              </div>
              <div>
                <label className="label">{L.demandes}</label>
                <textarea className="input" value={demandes} onChange={e => setDemandes(e.target.value)}
                  placeholder={L.demandesPh} rows={2}
                  style={{ resize: 'none', fontSize: isMobile ? 16 : 14 }} />
              </div>
              {error && <p style={{ color: '#ff7675', fontSize: 12 }}>⚠️ {error}</p>}
              <button className="btn btn-gold" onClick={handleSubmit} disabled={loading}
                style={{ width: '100%', padding: isMobile ? 15 : 13, fontSize: isMobile ? 15 : 14 }}>
                {loading ? '⏳ Envoi…' : `✅ ${L.commander}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

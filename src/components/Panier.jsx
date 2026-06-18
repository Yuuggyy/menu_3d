import { useState } from 'react';
import { createCommande } from '../lib/supabase';

const T = {
  fr: {
    panier: 'Ma Commande', vide: 'Votre panier est vide',
    table: 'Numéro de table *', tablePh: 'Ex: Table 5, Bar...',
    demandes: 'Demandes particulières', demandesPh: 'Allergies, sans sel, bien cuit...',
    commander: 'Passer la commande', annuler: 'Annuler',
    total: 'Total', confirmation: '✅ Commande envoyée ! Le serveur arrive bientôt.',
    errTable: 'Veuillez indiquer votre numéro de table.',
    items: 'article(s)',
  },
  en: {
    panier: 'My Order', vide: 'Your cart is empty',
    table: 'Table number *', tablePh: 'e.g. Table 5, Bar...',
    demandes: 'Special requests', demandesPh: 'Allergies, no salt, well done...',
    commander: 'Place order', annuler: 'Cancel',
    total: 'Total', confirmation: '✅ Order sent! The server will be with you shortly.',
    errTable: 'Please enter your table number.',
    items: 'item(s)',
  },
};

export default function Panier({ items, onUpdateQty, onRemove, onClose, onConfirm, lang }) {
  const [table, setTable]     = useState('');
  const [demandes, setDemandes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
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
      <div className="modal" style={{ maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#c9a84c' }}>
            🛒 {L.panier}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 22, cursor: 'pointer' }}>✕</button>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🛒</div>
            <p>{L.vide}</p>
          </div>
        ) : (
          <>
            {/* Liste articles */}
            <div style={{ marginBottom: 20 }}>
              {items.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#f5efe0', marginBottom: 2 }}>{item.nom}</p>
                    <p style={{ fontSize: 13, color: '#c9a84c' }}>{Number(item.prix_unit).toFixed(2)} €</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => onUpdateQty(idx, -1)} style={{
                      width: 28, height: 28, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)',
                      background: 'transparent', color: 'white', cursor: 'pointer', fontSize: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>−</button>
                    <span style={{ fontSize: 14, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.quantite}</span>
                    <button onClick={() => onUpdateQty(idx, 1)} style={{
                      width: 28, height: 28, borderRadius: '50%', border: 'none',
                      background: '#c9a84c', color: '#1a0a00', cursor: 'pointer', fontSize: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>+</button>
                    <button onClick={() => onRemove(idx)} style={{
                      background: 'none', border: 'none', color: 'rgba(255,100,100,0.7)',
                      cursor: 'pointer', fontSize: 16, padding: '0 4px',
                    }}>🗑️</button>
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#f5efe0', minWidth: 60, textAlign: 'right' }}>
                    {(item.prix_unit * item.quantite).toFixed(2)} €
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              padding: '12px 0', marginBottom: 20,
              borderTop: '2px solid rgba(201,168,76,0.3)',
            }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: '#c9a84c' }}>{L.total}</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#c9a84c' }}>{total.toFixed(2)} €</span>
            </div>

            {/* Formulaire */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="label">{L.table}</label>
                <input className="input" value={table} onChange={e => setTable(e.target.value)}
                  placeholder={L.tablePh} />
              </div>
              <div>
                <label className="label">{L.demandes}</label>
                <textarea className="input" value={demandes} onChange={e => setDemandes(e.target.value)}
                  placeholder={L.demandesPh} rows={3}
                  style={{ resize: 'vertical', minHeight: 80 }} />
              </div>
              {error && <p style={{ color: '#ff7675', fontSize: 13 }}>⚠️ {error}</p>}
              <button className="btn btn-gold" onClick={handleSubmit} disabled={loading} style={{ width: '100%', padding: 14 }}>
                {loading ? '⏳ Envoi...' : `✅ ${L.commander}`}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

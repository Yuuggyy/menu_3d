import { useState } from 'react';
import { createCommande } from '../lib/supabase';

const T = {
  fr: {
    panier: 'Ma Commande', vide: 'Panier vide',
    table: 'Numéro de table *', tablePh: 'Ex: 5, Bar…',
    demandes: 'Demandes particulières', demandesPh: 'Allergies, sans sel…',
    commander: 'Commander', total: 'Total',
    confirmationLabel: 'COMMANDE ENVOYÉE',
    confirmationSub: 'Votre commande a été transmise en cuisine.',
    errTable: 'Indiquez votre numéro de table.',
  },
  en: {
    panier: 'My Order', vide: 'Empty cart',
    table: 'Table number *', tablePh: 'e.g. 5, Bar…',
    demandes: 'Special requests', demandesPh: 'Allergies, no salt…',
    commander: 'Place order', total: 'Total',
    confirmationLabel: 'ORDER PLACED',
    confirmationSub: 'Your order has been sent to the kitchen.',
    errTable: 'Please enter your table number.',
  },
};

/* ── Écran de confirmation avec stamp ── */
function ConfirmationScreen({ lang, onClose }) {
  const L = T[lang] || T.fr;
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '48px 32px', gap: 24, textAlign: 'center',
    }}>
      <style>{`
        @keyframes stampIn {
          0%   { opacity: 0; transform: scale(2.5) rotate(-15deg); }
          55%  { opacity: 1; transform: scale(0.88) rotate(4deg); }
          75%  { transform: scale(1.06) rotate(-2deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50%       { opacity: 1; transform: scale(1); }
        }
      `}</style>

      {/* Tampon central */}
      <div style={{
        border: '4px solid #27ae60',
        borderRadius: 14,
        padding: '18px 36px',
        animation: 'stampIn 0.75s cubic-bezier(0.34,1.56,0.64,1) forwards',
        opacity: 0,
        position: 'relative',
        boxShadow: '0 0 40px rgba(39,174,96,0.25), inset 0 0 20px rgba(39,174,96,0.08)',
      }}>
        {/* Coins décoratifs */}
        {[['0','0'], ['0','auto'], ['auto','0'], ['auto','auto']].map(([t,b], i) => (
          <div key={i} style={{
            position: 'absolute',
            top: t !== 'auto' ? -2 : 'auto',
            bottom: b !== 'auto' ? -2 : 'auto',
            left: i % 2 === 0 ? -2 : 'auto',
            right: i % 2 !== 0 ? -2 : 'auto',
            width: 12, height: 12,
            border: '2px solid #27ae60',
            borderRadius: 2,
            background: 'var(--malamu-dark-2,#1A1917)',
          }} />
        ))}

        <p style={{
          fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
          fontSize: 26, fontWeight: 700,
          color: '#27ae60',
          letterSpacing: '4px',
          textTransform: 'uppercase',
        }}>{L.confirmationLabel}</p>
      </div>

      {/* Icône check */}
      <div style={{
        fontSize: 52,
        animation: 'fadeSlideUp 0.5s ease 0.7s both',
      }}>✅</div>

      {/* Message */}
      <p style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 16, color: 'rgba(245,239,224,0.7)',
        fontStyle: 'italic', lineHeight: 1.6,
        animation: 'fadeSlideUp 0.5s ease 0.9s both',
        maxWidth: 280,
      }}>{L.confirmationSub}</p>

      {/* Bouton fermer */}
      <button
        onClick={onClose}
        style={{
          background: 'linear-gradient(135deg,#C4622D,#E8936A)',
          border: 'none', borderRadius: 10,
          padding: '12px 32px',
          color: '#1a0a00', fontSize: 14, fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(196,98,45,0.4)',
          animation: 'fadeSlideUp 0.5s ease 1.1s both',
          fontFamily: "'Cormorant Garamond', serif",
          letterSpacing: '1px',
        }}
      >Fermer ✦</button>
    </div>
  );
}

export default function Panier({ items, onUpdateQty, onRemove, onClose, onConfirm, lang, isMobile }) {
  const [table, setTable]         = useState('');
  const [demandes, setDemandes]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const L = T[lang] || T.fr;

  const total = items.reduce((s, i) => s + i.prix_unit * i.quantite, 0);

  const handleSubmit = async () => {
    if (!table.trim()) { setError(L.errTable); return; }
    setLoading(true); setError('');
    const { error: err } = await createCommande(table.trim(), items, demandes.trim());
    setLoading(false);
    if (err) { setError(err.message); return; }
    setConfirmed(true);
    // Ferme + reset panier après 4 secondes
    setTimeout(() => {
      onConfirm('✅ ' + L.confirmationLabel);
    }, 4000);
  };

  return (
    <div className="modal-overlay" onClick={confirmed ? undefined : onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--malamu-dark-2,#1A1917)', border: '1px solid rgba(196,98,45,0.3)',
          borderRadius: isMobile ? '20px 20px 0 0' : 16,
          width: '100%',
          maxWidth: isMobile ? '100%' : 500,
          maxHeight: isMobile ? '92dvh' : '88vh',
          overflowY: 'auto',
          padding: confirmed ? 0 : (isMobile ? '20px 16px 32px' : '28px 28px 28px'),
          boxShadow: '0 -10px 40px rgba(0,0,0,0.7)',
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

        {/* ── CONFIRMATION ── */}
        {confirmed ? (
          <ConfirmationScreen lang={lang} onClose={() => onConfirm('✅ ' + L.confirmationLabel)} />
        ) : (
          <>
            {isMobile && (
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 16px' }} />
            )}

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', 'Playfair Display', serif",
                fontSize: isMobile ? 20 : 23, color: '#E8936A', fontWeight: 700, letterSpacing: '0.5px',
              }}>🛒 {L.panier}</h2>
              <button onClick={onClose} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                fontSize: 22, cursor: 'pointer', touchAction: 'manipulation',
              }}>✕</button>
            </div>

            {items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'rgba(255,255,255,0.3)' }}>
                <div style={{ fontSize: 44, marginBottom: 10 }}>🛒</div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontStyle: 'italic' }}>{L.vide}</p>
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
                        <p style={{
                          fontFamily: "'Cormorant Garamond', serif",
                          fontSize: isMobile ? 14 : 15, fontWeight: 600, color: '#f5efe0', marginBottom: 1,
                          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        }}>{item.nom}</p>
                        <p style={{ fontSize: 12, color: '#E8936A', fontFamily: "'Cormorant Garamond', serif" }}>
                          {Number(item.prix_unit).toFixed(2)} €
                        </p>
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
                          border: 'none', background: 'linear-gradient(135deg,#C4622D,#E8936A)', color: '#1a0a00',
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

                {/* Ornement + Total */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12,
                }}>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(196,98,45,0.3))' }} />
                  <span style={{ color: 'rgba(196,98,45,0.4)', fontSize: 10 }}>✦</span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(196,98,45,0.3))' }} />
                </div>
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 0', marginBottom: 18,
                }}>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 16, fontWeight: 700, color: '#E8936A', letterSpacing: '1px',
                  }}>{L.total}</span>
                  <span style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 22, fontWeight: 700, color: '#E8936A',
                  }}>{total.toFixed(2)} €</span>
                </div>

                {/* Formulaire */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div>
                    <label className="label">{L.table}</label>
                    <input className="input" value={table} onChange={e => setTable(e.target.value)}
                      placeholder={L.tablePh}
                      style={{ fontSize: isMobile ? 16 : 14 }}
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
                    style={{
                      width: '100%', padding: isMobile ? 15 : 13, fontSize: isMobile ? 15 : 14,
                      fontFamily: "'Cormorant Garamond', serif", letterSpacing: '1px', fontWeight: 700,
                    }}>
                    {loading ? '⏳ Envoi…' : '✦ ' + L.commander + ' ✦'}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

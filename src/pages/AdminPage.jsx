import { useState, useEffect } from 'react';
import {
  signInAdmin, signOutAdmin,
  getCommandes, updateStatutCommande,
  getAppels, traiterAppel,
  getAllProduits, getAllCategories,
  createProduit, updateProduit, deleteProduit,
  createCategorie, updateCategorie, deleteCategorie,
} from '../lib/supabase';
import { supabase } from '../lib/supabase';

const STATUTS = ['recue', 'en_cours', 'terminee', 'annulee'];
const STATUT_LABELS = { recue: '📬 Reçue', en_cours: '🔥 En cours', terminee: '✅ Terminée', annulee: '❌ Annulée' };
const STATUT_NEXT   = { recue: 'en_cours', en_cours: 'terminee' };

// ── Login ──
function LoginForm({ onLogin }) {
  const [email, setEmail]   = useState('');
  const [pwd, setPwd]       = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    const { data, error } = await signInAdmin(email, pwd);
    setLoading(false);
    if (error) { setError(error.message); return; }
    onLogin(data.user);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'radial-gradient(ellipse at top, #2a1505 0%, #0d0500 100%)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>👨‍🍳</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900,
            background: 'linear-gradient(135deg, #c9a84c, #e8d08a)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Administration</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginTop: 8 }}>Espace réservé au restaurant</p>
        </div>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="label">Mot de passe</label>
            <input className="input" type="password" value={pwd}
              onChange={e => setPwd(e.target.value)} required />
          </div>
          {error && <p style={{ color: '#ff7675', fontSize: 13 }}>⚠️ {error}</p>}
          <button className="btn btn-gold" type="submit" disabled={loading} style={{ padding: 14, marginTop: 8 }}>
            {loading ? '⏳ Connexion…' : '🔐 Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Commandes ──
function CommandesTab() {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filtre, setFiltre]       = useState('all');

  const load = async () => {
    setLoading(true);
    const { data } = await getCommandes();
    setCommandes(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); const iv = setInterval(load, 15000); return () => clearInterval(iv); }, []);

  const nextStatut = async (cmd) => {
    const next = STATUT_NEXT[cmd.statut];
    if (!next) return;
    await updateStatutCommande(cmd.id, next);
    load();
  };

  const filtered = filtre === 'all' ? commandes : commandes.filter(c => c.statut === filtre);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#c9a84c' }}>📋 Commandes</h2>
        <button onClick={load} className="btn btn-dark btn-sm">🔄 Actualiser</button>
      </div>

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', ...STATUTS].map(s => (
          <button key={s} onClick={() => setFiltre(s)} className="btn btn-sm"
            style={{
              background: filtre === s ? 'linear-gradient(135deg, #c9a84c, #e8d08a)' : 'rgba(201,168,76,0.1)',
              color: filtre === s ? '#1a0a00' : '#c9a84c',
              border: '1px solid rgba(201,168,76,0.3)',
            }}>
            {s === 'all' ? '🗂️ Toutes' : STATUT_LABELS[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
          <p>Aucune commande</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(cmd => (
            <div key={cmd.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>🪑</span>
                    <span style={{ fontWeight: 700, fontSize: 16, color: '#f5efe0' }}>Table {cmd.numero_table}</span>
                    <span className={`badge badge-${cmd.statut}`}>{STATUT_LABELS[cmd.statut]}</span>
                  </div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                    {new Date(cmd.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 20, fontWeight: 800, color: '#c9a84c' }}>{Number(cmd.montant_total).toFixed(2)} €</p>
                </div>
              </div>

              {/* Articles */}
              <div style={{ marginBottom: 12, paddingLeft: 8, borderLeft: '2px solid rgba(201,168,76,0.2)' }}>
                {(cmd.commande_items || []).map((item, i) => (
                  <p key={i} style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', padding: '2px 0' }}>
                    × {item.quantite} {item.nom_produit} — {Number(item.prix_unit).toFixed(2)} €
                  </p>
                ))}
              </div>

              {cmd.demandes_speciales && (
                <div style={{ background: 'rgba(255,200,0,0.08)', border: '1px solid rgba(255,200,0,0.2)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: '#f9ca24' }}>💬 {cmd.demandes_speciales}</p>
                </div>
              )}

              {/* Action */}
              {STATUT_NEXT[cmd.statut] && (
                <button className="btn btn-gold btn-sm" onClick={() => nextStatut(cmd)}>
                  {cmd.statut === 'recue' ? '🔥 Mettre en cours' : '✅ Marquer terminée'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Appels serveur ──
function AppelsTab() {
  const [appels, setAppels] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await getAppels();
    setAppels(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); const iv = setInterval(load, 10000); return () => clearInterval(iv); }, []);

  const traiter = async (id) => { await traiterAppel(id); load(); };

  const nonTraites = appels.filter(a => !a.traite);
  const traites    = appels.filter(a => a.traite);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#c9a84c' }}>
          🔔 Appels Serveur
          {nonTraites.length > 0 && (
            <span style={{ marginLeft: 10, background: '#c9a84c', color: '#1a0a00', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{nonTraites.length}</span>
          )}
        </h2>
        <button onClick={load} className="btn btn-dark btn-sm">🔄 Actualiser</button>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
      ) : appels.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔕</div>
          <p>Aucun appel</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[...nonTraites, ...traites].map(appel => (
            <div key={appel.id} className="card" style={{
              padding: 16, opacity: appel.traite ? 0.5 : 1,
              borderColor: !appel.traite ? 'rgba(201,168,76,0.5)' : 'rgba(255,255,255,0.1)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: appel.traite ? 'rgba(255,255,255,0.5)' : '#f5efe0' }}>
                    🪑 Table {appel.numero_table}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    {new Date(appel.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                {!appel.traite && (
                  <button className="btn btn-green btn-sm" onClick={() => traiter(appel.id)}>
                    ✓ Envoyé
                  </button>
                )}
                {appel.traite && <span style={{ color: '#55efc4', fontSize: 13 }}>✅ Traité</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Produits ──
function ProduitsTab() {
  const [produits, setProduits]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm] = useState({ nom:'', description:'', prix:'', categorie_id:'', image_url:'', disponible:true, ordre:0 });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = async () => {
    const [p, c] = await Promise.all([getAllProduits(), getAllCategories()]);
    setProduits(p.data || []);
    setCategories(c.data || []);
  };

  useEffect(() => { load(); }, []);

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openEdit = (p) => {
    setEditing(p);
    setForm({ nom: p.nom, description: p.description || '', prix: p.prix, categorie_id: p.categorie_id || '', image_url: p.image_url || '', disponible: p.disponible, ordre: p.ordre || 0 });
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    const payload = { ...form, prix: parseFloat(form.prix) || 0, ordre: parseInt(form.ordre) || 0 };
    const { error } = editing ? await updateProduit(editing.id, payload) : await createProduit(payload);
    if (error) { setError(error.message); return; }
    setSuccess(editing ? 'Produit mis à jour !' : 'Produit créé !');
    setShowForm(false); setEditing(null); setForm({ nom:'', description:'', prix:'', categorie_id:'', image_url:'', disponible:true, ordre:0 });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await deleteProduit(id); load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#c9a84c' }}>🍽️ Produits ({produits.length})</h2>
        <button className="btn btn-gold btn-sm" onClick={() => { setShowForm(true); setEditing(null); setForm({ nom:'', description:'', prix:'', categorie_id:'', image_url:'', disponible:true, ordre:0 }); }}>
          + Nouveau produit
        </button>
      </div>

      {success && <div style={{ background: 'rgba(39,174,96,0.15)', border: '1px solid #27ae60', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#55efc4', fontSize: 13 }}>✅ {success}</div>}

      {showForm && (
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ color: '#c9a84c', marginBottom: 16, fontSize: 16 }}>{editing ? '✏️ Modifier' : '➕ Nouveau produit'}</h3>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
              <div><label className="label">Nom *</label><input className="input" value={form.nom} onChange={e => sf('nom', e.target.value)} required /></div>
              <div><label className="label">Prix (€) *</label><input className="input" type="number" step="0.01" value={form.prix} onChange={e => sf('prix', e.target.value)} required /></div>
              <div>
                <label className="label">Catégorie</label>
                <select className="input" value={form.categorie_id} onChange={e => sf('categorie_id', e.target.value)}>
                  <option value="">-- Aucune --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.nom}</option>)}
                </select>
              </div>
              <div><label className="label">URL image</label><input className="input" value={form.image_url} onChange={e => sf('image_url', e.target.value)} placeholder="https://..." /></div>
              <div><label className="label">Ordre</label><input className="input" type="number" value={form.ordre} onChange={e => sf('ordre', e.target.value)} /></div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#f5efe0' }}>
                  <input type="checkbox" checked={form.disponible} onChange={e => sf('disponible', e.target.checked)} style={{ width: 16, height: 16 }} />
                  Disponible
                </label>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="label">Description</label>
                <textarea className="input" value={form.description} onChange={e => sf('description', e.target.value)} rows={3} style={{ resize: 'vertical' }} />
              </div>
            </div>
            {error && <p style={{ color: '#ff7675', fontSize: 13, marginTop: 8 }}>⚠️ {error}</p>}
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="button" className="btn btn-dark" onClick={() => { setShowForm(false); setEditing(null); }}>Annuler</button>
              <button type="submit" className="btn btn-gold">{editing ? 'Mettre à jour' : 'Créer'}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {produits.map(p => (
          <div key={p.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {p.image_url ? <img src={p.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>🍽️</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 14, color: '#f5efe0' }}>{p.nom}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{p.categories?.nom || '—'}</p>
            </div>
            <p style={{ color: '#c9a84c', fontWeight: 700, fontSize: 15 }}>{Number(p.prix).toFixed(2)} €</p>
            <span style={{ fontSize: 11, color: p.disponible ? '#55efc4' : '#ff7675' }}>{p.disponible ? '✅' : '❌'}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-dark btn-sm" onClick={() => openEdit(p)}>✏️</button>
              <button className="btn btn-sm" style={{ background: 'rgba(192,57,43,0.2)', color: '#ff7675', border: '1px solid rgba(192,57,43,0.3)' }} onClick={() => handleDelete(p.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Catégories ──
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [form, setForm]   = useState({ nom:'', description:'', emoji:'🍽️', ordre:0, actif:true });
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = async () => { const { data } = await getAllCategories(); setCategories(data || []); };
  useEffect(() => { load(); }, []);

  const sf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault(); setError('');
    const { error } = editing ? await updateCategorie(editing.id, form) : await createCategorie(form);
    if (error) { setError(error.message); return; }
    setShowForm(false); setEditing(null); setForm({ nom:'', description:'', emoji:'🍽️', ordre:0, actif:true });
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    await deleteCategorie(id); load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: '#c9a84c' }}>📂 Catégories ({categories.length})</h2>
        <button className="btn btn-gold btn-sm" onClick={() => { setShowForm(true); setEditing(null); setForm({ nom:'', description:'', emoji:'🍽️', ordre:0, actif:true }); }}>+ Nouvelle catégorie</button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
              <div><label className="label">Nom *</label><input className="input" value={form.nom} onChange={e => sf('nom', e.target.value)} required /></div>
              <div><label className="label">Emoji</label><input className="input" value={form.emoji} onChange={e => sf('emoji', e.target.value)} style={{ fontSize: 20 }} /></div>
              <div><label className="label">Ordre</label><input className="input" type="number" value={form.ordre} onChange={e => sf('ordre', e.target.value)} /></div>
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#f5efe0' }}>
                  <input type="checkbox" checked={form.actif} onChange={e => sf('actif', e.target.checked)} style={{ width: 16, height: 16 }} />
                  Active
                </label>
              </div>
            </div>
            {error && <p style={{ color: '#ff7675', fontSize: 13, marginTop: 8 }}>⚠️ {error}</p>}
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              <button type="button" className="btn btn-dark" onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" className="btn btn-gold">{editing ? 'Modifier' : 'Créer'}</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {categories.map(c => (
          <div key={c.id} className="card" style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }}>{c.emoji}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, color: '#f5efe0' }}>{c.nom}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Ordre : {c.ordre}</p>
            </div>
            <span style={{ fontSize: 11, color: c.actif ? '#55efc4' : '#ff7675' }}>{c.actif ? '✅ Active' : '❌ Inactive'}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-dark btn-sm" onClick={() => { setEditing(c); setForm({ nom:c.nom, description:c.description||'', emoji:c.emoji||'🍽️', ordre:c.ordre||0, actif:c.actif }); setShowForm(true); }}>✏️</button>
              <button className="btn btn-sm" style={{ background: 'rgba(192,57,43,0.2)', color: '#ff7675', border: '1px solid rgba(192,57,43,0.3)' }} onClick={() => handleDelete(c.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══ Admin Principal ══
export default function AdminPage() {
  const [user, setUser]   = useState(null);
  const [tab, setTab]     = useState('commandes');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0500' }}>
      <div className="spinner" />
    </div>
  );

  if (!user) return <LoginForm onLogin={setUser} />;

  const TABS = [
    { id: 'commandes',  label: '📋 Commandes' },
    { id: 'appels',     label: '🔔 Appels' },
    { id: 'produits',   label: '🍽️ Produits' },
    { id: 'categories', label: '📂 Catégories' },
  ];

  return (
    <div className="admin-shell">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid rgba(201,168,76,0.15)', marginBottom: 16 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, color: '#c9a84c', fontWeight: 900 }}>
            👨‍🍳 Admin
          </h2>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{user.email}</p>
        </div>
        {TABS.map(t => (
          <button key={t.id} className={`admin-nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
        <div style={{ marginTop: 'auto', padding: '0 16px 0' }}>
          <button className="btn btn-dark btn-sm" style={{ width: '100%', marginBottom: 8 }}
            onClick={() => window.open('/', '_blank')}>👁️ Voir le menu</button>
          <button className="btn btn-sm" style={{ width: '100%', background: 'rgba(192,57,43,0.2)', color: '#ff7675', border: '1px solid rgba(192,57,43,0.2)' }}
            onClick={async () => { await signOutAdmin(); setUser(null); }}>🚪 Déconnexion</button>
        </div>
      </aside>

      {/* Contenu */}
      <main className="admin-content">
        {tab === 'commandes'  && <CommandesTab />}
        {tab === 'appels'     && <AppelsTab />}
        {tab === 'produits'   && <ProduitsTab />}
        {tab === 'categories' && <CategoriesTab />}
      </main>
    </div>
  );
}

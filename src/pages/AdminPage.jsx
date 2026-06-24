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

const STATUTS = ['pending','in_progress','done','cancelled'];
const STATUT_LABELS = { pending:'📬 Reçue', in_progress:'🔥 En cours', done:'✅ Terminée', cancelled:'❌ Annulée' };
const STATUT_NEXT   = { pending:'in_progress', in_progress:'done' };

function LoginForm({ onLogin }) {
  const [email,setEmail]=useState('admin@malamu.com');
  const [pwd,setPwd]=useState('');
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);
  const submit=async(e)=>{
    e.preventDefault();setError('');setLoading(true);
    const{data,error}=await signInAdmin(email,pwd);
    setLoading(false);
    if(error){setError(error.message);return;}
    onLogin(data.user);
  };
  return(
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'radial-gradient(ellipse at top,#2a1505 0%,#0d0500 100%)',padding:20}}>
      <div style={{width:'100%',maxWidth:400}}>
        <div style={{textAlign:'center',marginBottom:40}}>
          <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:700,color:'#F5EFE0',letterSpacing:3}}>MALAMU</h1>
          <p style={{color:'rgba(255,255,255,0.4)',fontSize:13,marginTop:6,letterSpacing:2,textTransform:'uppercase'}}>Administration</p>
        </div>
        <form onSubmit={submit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <div><label className="label">Email</label><input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div><label className="label">Mot de passe</label><input className="input" type="password" value={pwd} onChange={e=>setPwd(e.target.value)} required autoFocus/></div>
          {error&&<p style={{color:'#ff7675',fontSize:13}}>⚠️ {error}</p>}
          <button className="btn btn-gold" type="submit" disabled={loading} style={{padding:14,marginTop:8}}>{loading?'⏳ Connexion…':'Se connecter'}</button>
        </form>
      </div>
    </div>
  );
}

function CommandesTab() {
  const [commandes,setCommandes]=useState([]);
  const [loading,setLoading]=useState(true);
  const [filtre,setFiltre]=useState('all');

  const load=async()=>{
    setLoading(true);
    const{data}=await getCommandes();
    setCommandes(data||[]);
    setLoading(false);
  };

  useEffect(()=>{load();const iv=setInterval(load,15000);return()=>clearInterval(iv);},[]);

  const nextStatut=async(cmd)=>{
    const next=STATUT_NEXT[cmd.status];
    if(!next)return;
    await updateStatutCommande(cmd.id,next);
    load();
  };

  const filtered=filtre==='all'?commandes:commandes.filter(c=>c.status===filtre);

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:'#C4622D'}}>Commandes</h2>
        <button onClick={load} className="btn btn-dark btn-sm">🔄</button>
      </div>
      <div style={{display:'flex',gap:8,marginBottom:20,flexWrap:'wrap'}}>
        {['all',...STATUTS].map(s=>(
          <button key={s} onClick={()=>setFiltre(s)} className="btn btn-sm"
            style={{background:filtre===s?'#C4622D':'rgba(196,98,45,0.1)',color:filtre===s?'#F5EFE0':'#C4622D',border:'1px solid rgba(196,98,45,0.3)'}}>
            {s==='all'?'Toutes':STATUT_LABELS[s]}
          </button>
        ))}
      </div>
      {loading?<div style={{display:'flex',justifyContent:'center',padding:40}}><div className="spinner"/></div>
      :filtered.length===0?<div style={{textAlign:'center',padding:60,color:'rgba(255,255,255,0.3)'}}><div style={{fontSize:40,marginBottom:12}}>📭</div><p>Aucune commande</p></div>
      :<div style={{display:'flex',flexDirection:'column',gap:16}}>
        {filtered.map(cmd=>(
          <div key={cmd.id} className="card" style={{padding:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12,flexWrap:'wrap',gap:8}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                  <span style={{fontWeight:700,fontSize:16,color:'#f5efe0'}}>Table {cmd.table_number}</span>
                  <span className={`badge badge-${cmd.status}`}>{STATUT_LABELS[cmd.status]||cmd.status}</span>
                </div>
                <p style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{new Date(cmd.created_at).toLocaleString('fr-FR')}</p>
              </div>
              <p style={{fontSize:20,fontWeight:800,color:'#C4622D'}}>{Number(cmd.total_amount||0).toFixed(2)} $</p>
            </div>
            {cmd.special_requests&&(
              <div style={{background:'rgba(255,200,0,0.08)',border:'1px solid rgba(255,200,0,0.2)',borderRadius:8,padding:'8px 12px',marginBottom:12}}>
                <p style={{fontSize:12,color:'#f9ca24'}}>💬 {cmd.special_requests}</p>
              </div>
            )}
            {STATUT_NEXT[cmd.status]&&(
              <button className="btn btn-gold btn-sm" onClick={()=>nextStatut(cmd)}>
                {cmd.status==='pending'?'🔥 Mettre en cours':'✅ Marquer terminée'}
              </button>
            )}
          </div>
        ))}
      </div>}
    </div>
  );
}

function AppelsTab() {
  const [appels,setAppels]=useState([]);
  const [loading,setLoading]=useState(true);

  const load=async()=>{
    setLoading(true);
    const{data}=await getAppels();
    setAppels(data||[]);
    setLoading(false);
  };

  useEffect(()=>{load();const iv=setInterval(load,10000);return()=>clearInterval(iv);},[]);

  const traiter=async(id)=>{await traiterAppel(id);load();};
  const nonTraites=appels.filter(a=>!a.handled);
  const traites=appels.filter(a=>a.handled);

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:'#C4622D'}}>
          Appels Serveur
          {nonTraites.length>0&&<span style={{marginLeft:10,background:'#C4622D',color:'#F5EFE0',borderRadius:'50%',width:24,height:24,display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800}}>{nonTraites.length}</span>}
        </h2>
        <button onClick={load} className="btn btn-dark btn-sm">🔄</button>
      </div>
      {loading?<div style={{display:'flex',justifyContent:'center',padding:40}}><div className="spinner"/></div>
      :appels.length===0?<div style={{textAlign:'center',padding:60,color:'rgba(255,255,255,0.3)'}}><div style={{fontSize:40,marginBottom:12}}>🔕</div><p>Aucun appel</p></div>
      :<div style={{display:'flex',flexDirection:'column',gap:12}}>
        {[...nonTraites,...traites].map(appel=>(
          <div key={appel.id} className="card" style={{padding:16,opacity:appel.handled?0.5:1,borderColor:!appel.handled?'rgba(196,98,45,0.5)':'rgba(255,255,255,0.1)'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <p style={{fontWeight:700,fontSize:15,color:appel.handled?'rgba(255,255,255,0.5)':'#f5efe0'}}>🪑 Table {appel.table_number}</p>
                <p style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginTop:2}}>{new Date(appel.created_at).toLocaleString('fr-FR')}</p>
              </div>
              {!appel.handled&&<button className="btn btn-green btn-sm" onClick={()=>traiter(appel.id)}>✓ Traité</button>}
              {appel.handled&&<span style={{color:'#55efc4',fontSize:13}}>✅ Traité</span>}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

function PlatsTab() {
  const [plats,setPlats]=useState([]);
  const [cats,setCats]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({name:'',description:'',price:'',category_id:'',image_url:'',available:true,position:0});

  const load=async()=>{
    setLoading(true);
    const[{data:p},{data:c}]=await Promise.all([getAllProduits(),getAllCategories()]);
    setPlats(p||[]);setCats(c||[]);setLoading(false);
  };

  useEffect(()=>{load();},[]);

  const sf=(k,v)=>setForm(f=>({...f,[k]:v}));

  const save=async()=>{
    const payload={...form,price:parseFloat(form.price)||0,position:parseInt(form.position)||0};
    if(editing){await updateProduit(editing.id,payload);}
    else{await createProduit(payload);}
    reset();load();
  };

  const reset=()=>{setShowForm(false);setEditing(null);setForm({name:'',description:'',price:'',category_id:'',image_url:'',available:true,position:0});};

  const del=async(id)=>{if(window.confirm('Supprimer ce plat ?')){await deleteProduit(id);load();}};

  const edit=(p)=>{setEditing(p);setForm({name:p.name,description:p.description||'',price:p.price,category_id:p.category_id||'',image_url:p.image_url||'',available:p.available,position:p.position||0});setShowForm(true);};

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:'#C4622D'}}>Plats</h2>
        <button className="btn btn-gold btn-sm" onClick={()=>{reset();setShowForm(true);}}>+ Nouveau plat</button>
      </div>
      {showForm&&(
        <div className="card" style={{padding:24,marginBottom:24}}>
          <h3 style={{color:'#C4622D',marginBottom:16,fontFamily:"'Cormorant Garamond',serif"}}>{editing?'Modifier':'Nouveau plat'}</h3>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label className="label">Nom</label><input className="input" value={form.name} onChange={e=>sf('name',e.target.value)}/></div>
            <div><label className="label">Prix ($)</label><input className="input" type="number" step="0.5" value={form.price} onChange={e=>sf('price',e.target.value)}/></div>
            <div style={{gridColumn:'1/-1'}}><label className="label">Description</label><input className="input" value={form.description} onChange={e=>sf('description',e.target.value)}/></div>
            <div><label className="label">Catégorie</label>
              <select className="input" value={form.category_id} onChange={e=>sf('category_id',e.target.value)}>
                <option value="">—</option>
                {cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div><label className="label">Position</label><input className="input" type="number" value={form.position} onChange={e=>sf('position',e.target.value)}/></div>
            <div style={{gridColumn:'1/-1'}}><label className="label">Image URL</label><input className="input" value={form.image_url} onChange={e=>sf('image_url',e.target.value)}/></div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <input type="checkbox" checked={form.available} onChange={e=>sf('available',e.target.checked)} style={{width:16,height:16}}/>
              <label className="label" style={{margin:0}}>Disponible</label>
            </div>
          </div>
          <div style={{display:'flex',gap:12,marginTop:16}}>
            <button className="btn btn-gold" onClick={save}>{editing?'💾 Enregistrer':'➕ Créer'}</button>
            <button className="btn btn-dark" onClick={reset}>Annuler</button>
          </div>
        </div>
      )}
      {loading?<div style={{display:'flex',justifyContent:'center',padding:40}}><div className="spinner"/></div>
      :<div style={{display:'flex',flexDirection:'column',gap:8}}>
        {plats.map(p=>(
          <div key={p.id} className="card" style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
            {p.image_url&&<img src={p.image_url} alt="" style={{width:48,height:48,borderRadius:6,objectFit:'cover'}}/>}
            <div style={{flex:1}}>
              <p style={{fontWeight:600,color:'#f5efe0',fontSize:14}}>{p.name}</p>
              <p style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>{cats.find(c=>c.id===p.category_id)?.name||'—'}</p>
            </div>
            <span style={{color:'#C4622D',fontWeight:700}}>{Number(p.price).toFixed(2)} $</span>
            <span style={{fontSize:11,color:p.available?'#55efc4':'#ff7675'}}>{p.available?'✅':'❌'}</span>
            <button className="btn btn-dark btn-sm" onClick={()=>edit(p)}>✏️</button>
            <button className="btn btn-red btn-sm" onClick={()=>del(p.id)}>🗑️</button>
          </div>
        ))}
      </div>}
    </div>
  );
}

function CategoriesTab() {
  const [cats,setCats]=useState([]);
  const [loading,setLoading]=useState(true);
  const [showForm,setShowForm]=useState(false);
  const [editing,setEditing]=useState(null);
  const [form,setForm]=useState({name:'',position:0});

  const load=async()=>{setLoading(true);const{data}=await getAllCategories();setCats(data||[]);setLoading(false);};
  useEffect(()=>{load();},[]);

  const sf=(k,v)=>setForm(f=>({...f,[k]:v}));
  const reset=()=>{setShowForm(false);setEditing(null);setForm({name:'',position:0});};

  const save=async()=>{
    const payload={...form,position:parseInt(form.position)||0};
    if(editing){await updateCategorie(editing.id,payload);}
    else{await createCategorie(payload);}
    reset();load();
  };

  const del=async(id)=>{if(window.confirm('Supprimer cette catégorie ?')){await deleteCategorie(id);load();}};

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
        <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,color:'#C4622D'}}>Catégories</h2>
        <button className="btn btn-gold btn-sm" onClick={()=>{reset();setShowForm(true);}}>+ Nouvelle catégorie</button>
      </div>
      {showForm&&(
        <div className="card" style={{padding:24,marginBottom:24}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div><label className="label">Nom</label><input className="input" value={form.name} onChange={e=>sf('name',e.target.value)}/></div>
            <div><label className="label">Position</label><input className="input" type="number" value={form.position} onChange={e=>sf('position',e.target.value)}/></div>
          </div>
          <div style={{display:'flex',gap:12,marginTop:16}}>
            <button className="btn btn-gold" onClick={save}>{editing?'💾 Enregistrer':'➕ Créer'}</button>
            <button className="btn btn-dark" onClick={reset}>Annuler</button>
          </div>
        </div>
      )}
      {loading?<div style={{display:'flex',justifyContent:'center',padding:40}}><div className="spinner"/></div>
      :<div style={{display:'flex',flexDirection:'column',gap:8}}>
        {cats.map(c=>(
          <div key={c.id} className="card" style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:12}}>
            <div style={{flex:1}}>
              <p style={{fontWeight:600,color:'#f5efe0'}}>{c.name}</p>
              <p style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Position {c.position}</p>
            </div>
            <button className="btn btn-dark btn-sm" onClick={()=>{setEditing(c);setForm({name:c.name,position:c.position||0});setShowForm(true);}}>✏️</button>
            <button className="btn btn-red btn-sm" onClick={()=>del(c.id)}>🗑️</button>
          </div>
        ))}
      </div>}
    </div>
  );
}

export default function AdminPage() {
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState('commandes');
  const [checking,setChecking]=useState(true);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{setUser(session?.user||null);setChecking(false);});
    const{data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>setUser(session?.user||null));
    return()=>subscription.unsubscribe();
  },[]);

  if(checking)return<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#0F0F0E'}}><div className="spinner"/></div>;
  if(!user)return<LoginForm onLogin={setUser}/>;

  const TABS=[{id:'commandes',label:'Commandes'},{id:'appels',label:'Appels'},{id:'plats',label:'Plats'},{id:'categories',label:'Catégories'}];

  return(
    <div style={{minHeight:'100vh',background:'#0F0F0E',color:'#F5EFE0'}}>
      <div style={{background:'rgba(196,98,45,0.08)',borderBottom:'1px solid rgba(196,98,45,0.2)',padding:'16px 24px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:24,fontWeight:700,color:'#F5EFE0',letterSpacing:2}}>MALAMU — Admin</h1>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <span style={{fontSize:13,color:'rgba(255,255,255,0.4)'}}>{user.email}</span>
          <button className="btn btn-dark btn-sm" onClick={async()=>{await signOutAdmin();setUser(null);}}>Déconnexion</button>
        </div>
      </div>
      <div style={{display:'flex',gap:4,padding:'0 24px',borderBottom:'1px solid rgba(255,255,255,0.08)',overflowX:'auto'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'14px 20px',border:'none',background:'transparent',color:tab===t.id?'#C4622D':'rgba(255,255,255,0.4)',borderBottom:tab===t.id?'2px solid #C4622D':'2px solid transparent',cursor:'pointer',fontSize:14,fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontWeight:tab===t.id?700:400,whiteSpace:'nowrap',transition:'color 0.2s'}}>
            {t.label}
          </button>
        ))}
      </div>
      <div style={{padding:24,maxWidth:900,margin:'0 auto'}}>
        {tab==='commandes'&&<CommandesTab/>}
        {tab==='appels'&&<AppelsTab/>}
        {tab==='plats'&&<PlatsTab/>}
        {tab==='categories'&&<CategoriesTab/>}
      </div>
    </div>
  );
}

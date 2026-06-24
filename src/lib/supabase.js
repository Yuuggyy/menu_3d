import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

/* ─── Schéma réel Supabase Malamu ───────────────────────────
   categories : id, name, position, created_at
   dishes     : id, category_id, name, description, price, image_url, position, available, created_at
   orders     : id, ... (vide pour l'instant — à créer si besoin)
──────────────────────────────────────────────────────────── */

// ── Catégories ──
export const getCategories = () =>
  supabase
    .from('categories')
    .select('*')
    .order('position');

// ── Plats ──
export const getProduits = () =>
  supabase
    .from('dishes')
    .select('*, categories(name)')
    .eq('available', true)
    .order('position');

export const getProduitsByCategorie = (catId) =>
  supabase
    .from('dishes')
    .select('*')
    .eq('category_id', catId)
    .eq('available', true)
    .order('position');

// ── Commandes ──
export const createCommande = async (numeroTable, items, demandesSpeciales) => {
  const montantTotal = items.reduce((sum, i) => sum + i.prix_unit * i.quantite, 0);
  const { data: cmd, error } = await supabase
    .from('orders')
    .insert({
      table_number: numeroTable,
      special_requests: demandesSpeciales,
      total_amount: montantTotal,
      status: 'pending',
    })
    .select()
    .single();
  if (error) return { error };
  return { data: cmd, error: null };
};

// ── Appel serveur ──
export const appelServeur = async (numeroTable) => {
  // On insère dans orders avec un flag "waiter_call"
  const { data, error } = await supabase
    .from('orders')
    .insert({
      table_number: numeroTable,
      special_requests: 'APPEL SERVEUR',
      total_amount: 0,
      status: 'waiter_call',
    });
  return { data, error };
};

// ── Admin ──
export const signInAdmin = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOutAdmin = () => supabase.auth.signOut();

export const getCommandes = () =>
  supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

export const updateStatutCommande = (id, statut) =>
  supabase.from('orders').update({ status: statut }).eq('id', id);

export const getAllProduits = () =>
  supabase
    .from('dishes')
    .select('*, categories(name)')
    .order('position');

export const getAllCategories = () =>
  supabase
    .from('categories')
    .select('*')
    .order('position');

export const createProduit = (p) =>
  supabase.from('dishes').insert(p).select().single();

export const updateProduit = (id, p) =>
  supabase.from('dishes').update(p).eq('id', id);

export const deleteProduit = (id) =>
  supabase.from('dishes').delete().eq('id', id);

export const createCategorie = (c) =>
  supabase.from('categories').insert(c).select().single();

export const updateCategorie = (id, c) =>
  supabase.from('categories').update(c).eq('id', id);

export const deleteCategorie = (id) =>
  supabase.from('categories').delete().eq('id', id);

// ── Appels serveur (alias pour compatibilité AdminPage) ──
export const getAppels = () =>
  supabase
    .from('orders')
    .select('*')
    .eq('status', 'waiter_call')
    .order('created_at', { ascending: false });

export const traiterAppel = (id) =>
  supabase.from('orders').update({ status: 'handled' }).eq('id', id);

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export const getCategories = () =>
  supabase.from('categories').select('*').order('position');

export const getProduits = () =>
  supabase.from('dishes').select('*, categories(name)').eq('available', true).order('position');

export const getProduitsByCategorie = (catId) =>
  supabase.from('dishes').select('*').eq('category_id', catId).eq('available', true).order('position');

export const createCommande = async (tableNumber, items, specialRequests) => {
  const totalAmount = items.reduce((sum, i) => sum + parseFloat(i.prix) * i.quantite, 0);
  const { data: cmd, error } = await supabase
    .from('orders')
    .insert({ table_number: tableNumber, special_requests: specialRequests, total_amount: totalAmount, status: 'pending' })
    .select().single();
  if (error) return { error };
  const lignes = items.map(i => ({
    order_id: cmd.id,
    dish_id: i.id,
    dish_name: i.nom,
    price: parseFloat(i.prix),
    quantity: i.quantite,
  }));
  const { error: err2 } = await supabase.from('order_items').insert(lignes);
  return { data: cmd, error: err2 };
};

export const appelServeur = (tableNumber) =>
  supabase.from('waiter_calls').insert({ table_number: tableNumber, handled: false });

export const signInAdmin = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOutAdmin = () => supabase.auth.signOut();

export const getCommandes = () =>
  supabase.from('orders').select('*').order('created_at', { ascending: false });

export const updateStatutCommande = (id, status) =>
  supabase.from('orders').update({ status }).eq('id', id);

export const getAppels = () =>
  supabase.from('waiter_calls').select('*').order('created_at', { ascending: false });

export const traiterAppel = (id) =>
  supabase.from('waiter_calls').update({ handled: true }).eq('id', id);

export const getAllProduits = () =>
  supabase.from('dishes').select('*, categories(name)').order('position');

export const getAllCategories = () =>
  supabase.from('categories').select('*').order('position');

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

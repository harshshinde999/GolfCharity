import { supabase } from './supabase';

// SIGN UP
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

// LOGIN
export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

// LOGOUT
export const logout = async () => {
  await supabase.auth.signOut();
};

// GET USER
export const getUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data?.user;
};
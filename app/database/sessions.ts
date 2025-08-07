import { supabase } from './supabase';

export interface Session {
  id?: string;
  title: string;
  transcription: string;
  key_sentences?: string;
  created_at?: string;
}

export async function createSession(session: Session) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert([session])
      .select();

    if (error) {
      console.error('Error creating session:', error);
      throw error;
    }

    return data?.[0];
  } catch (error) {
    console.error('Database error creating session:', error);
    throw error;
  }
}

export async function getSessions() {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Database error fetching sessions:', error);
    throw error;
  }
}

export async function getSessionById(id: string) {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching session:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Database error fetching session:', error);
    throw error;
  }
}

export async function deleteSession(id: string) {
  try {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting session:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Database error deleting session:', error);
    throw error;
  }
} 
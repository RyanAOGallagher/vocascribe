import { supabase } from './supabase';

export interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  first_seen: string;
  occurrences: number;
}

export interface CreateVocabularyItem {
  word: string;
  translation: string;
}

// Get all vocabulary items for the current user
export async function getVocabularyItems(): Promise<VocabularyItem[]> {
  try {
    const { data, error } = await supabase
      .from('user_vocab')
      .select('*')
      .order('word', { ascending: true });

    if (error) {
      console.error('Error fetching vocabulary items:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getVocabularyItems:', error);
    return [];
  }
}

// Add a new vocabulary item
export async function addVocabularyItem(item: CreateVocabularyItem): Promise<VocabularyItem | null> {
  try {
    const { data, error } = await supabase
      .from('user_vocab')
      .insert({
        word: item.word.trim(), // Korean word - don't convert to lowercase
        translation: item.translation.trim(), // English translation
        first_seen: new Date().toISOString(),
        occurrences: 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding vocabulary item:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addVocabularyItem:', error);
    return null;
  }
}

// Update occurrences for a vocabulary item
export async function updateVocabularyOccurrences(word: string, occurrences: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_vocab')
      .update({ occurrences })
      .eq('word', word); // Don't convert to lowercase for Korean words

    if (error) {
      console.error('Error updating vocabulary occurrences:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in updateVocabularyOccurrences:', error);
    return false;
  }
}

// Check if a word exists in vocabulary
export async function wordExistsInVocabulary(word: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_vocab')
      .select('id')
      .eq('word', word) // Don't convert to lowercase for Korean words
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking if word exists:', error);
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error in wordExistsInVocabulary:', error);
    return false;
  }
}

// Increment occurrences for a word (used when word is found in transcription)
export async function incrementVocabularyOccurrences(word: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_vocab')
      .select('occurrences')
      .eq('word', word) // Don't convert to lowercase for Korean words
      .single();

    if (error) {
      console.error('Error fetching current occurrences:', error);
      throw error;
    }

    const newOccurrences = (data?.occurrences || 0) + 1;
    
    return await updateVocabularyOccurrences(word, newOccurrences);
  } catch (error) {
    console.error('Error in incrementVocabularyOccurrences:', error);
    return false;
  }
}

// Delete a vocabulary item
export async function deleteVocabularyItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_vocab')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting vocabulary item:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteVocabularyItem:', error);
    return false;
  }
} 
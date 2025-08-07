import { getVocabularyItems, addVocabularyItem, wordExistsInVocabulary, incrementVocabularyOccurrences } from '../../database/vocabulary';

// Function to get the current vocabulary list
export async function getVocabularyList(): Promise<string[]> {
  try {
    const vocabularyItems = await getVocabularyItems();
    return vocabularyItems.map(item => item.word);
  } catch (error) {
    console.error('Error getting vocabulary list:', error);
    return [];
  }
}

// Function to add new words to the vocabulary list
export async function addToVocabularyList(newWords: string[]): Promise<void> {
  try {
    for (const word of newWords) {
      const exists = await wordExistsInVocabulary(word);
      if (!exists) {
        // Add with a default translation - in a real app, you might want to get translation from an API
        await addVocabularyItem({
          word: word, // Korean word - don't convert to lowercase
          translation: `[Translation for ${word}]`
        });
      }
    }
  } catch (error) {
    console.error('Error adding words to vocabulary list:', error);
  }
}

// Function to check if a word is in the vocabulary list
export async function isWordInVocabulary(word: string): Promise<boolean> {
  try {
    return await wordExistsInVocabulary(word); // Don't convert to lowercase for Korean words
  } catch (error) {
    console.error('Error checking if word is in vocabulary:', error);
    return false;
  }
}

// Function to increment occurrences for words found in transcription
export async function incrementWordsOccurrences(words: string[]): Promise<void> {
  try {
    for (const word of words) {
      const exists = await wordExistsInVocabulary(word);
      if (exists) {
        await incrementVocabularyOccurrences(word);
      }
    }
  } catch (error) {
    console.error('Error incrementing word occurrences:', error);
  }
} 
import { API_URL } from '@/config/constants';

export interface DuaResponse {
  arabic_text: string;
  english_translation: string;
  urdu_translation: string;
  reference: string;
  title: string;
  note?: string;
}

/**
 * Search for dua using Gemini AI
 */
export async function searchDuaWithAI(query: string): Promise<DuaResponse> {
  try {
    console.log('Searching dua:', query);
    
    const response = await fetch(`${API_URL}/api/gemini/dua`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to search for dua');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching for dua:', error);
    throw error;
  }
} 
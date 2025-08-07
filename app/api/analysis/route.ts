import { NextRequest, NextResponse } from 'next/server';
import { ai } from '../shared/gemini';
import { getVocabularyList } from '../shared/vocabulary';

export async function POST(request: NextRequest) {
  try {
    const { transcription } = await request.json();
    console.log(transcription);
    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcription is required' },
        { status: 400 }
      );
    }


const existing_vocab_list = await getVocabularyList();
const existing_vocab_string = existing_vocab_list.join(', ');
console.log('started');

const prompt = `You are a JSON-only response bot. Analyze the following transcription and count how many times each word/phrase appears. For adjectives and verbs use the dictionary form.

CRITICAL: Return ONLY a valid JSON object. Do NOT use markdown formatting, code blocks, or any other text. Start with { and end with }.

{
  "word": "word_or_phrase",
  "count": number
}



Transcription: "${transcription}"`;
    // Generate content using the new API
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
console.log('done')
console.log(response.text)
    const analysis = response.text || 'No analysis generated';
    
    // Try to parse the JSON response
    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch (error) {
      console.error('Failed to parse analysis JSON:', error);
      // Fallback to text if parsing fails
      parsedAnalysis = { rawText: analysis };
    }

    return NextResponse.json({
      success: true,
      analysis: parsedAnalysis,
      rawText: analysis // Keep original text as backup
    });

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return NextResponse.json(
      { error: 'Failed to analyze transcription' },
      { status: 500 }
    );
  }
} 
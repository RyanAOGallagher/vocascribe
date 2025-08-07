import { NextRequest, NextResponse } from 'next/server';
import { ai } from '../shared/gemini';

export async function POST(request: NextRequest) {
  try {
    const { transcription } = await request.json();
    
    if (!transcription) {
      return NextResponse.json(
        { error: 'Transcription is required' },
        { status: 400 }
      );
    }

    const prompt = `Extract 3 short key expressions from the transcript and provide their translations. These should be the most important or representative sentences that capture the main points or essence of what was said.

Transcription: "${transcription}"

Please return exactly 3 key expressions with their translations in the following format:
Original: [key expression]
Translation: [translation]

Separate each pair with a blank line.`;

    // Generate content using Gemini
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const keySentences = response.text || 'No key sentences generated';

    return NextResponse.json({
      success: true,
      keySentences: keySentences,
    });

  } catch (error) {
    console.error('Error extracting key sentences:', error);
    return NextResponse.json(
      { error: 'Failed to extract key sentences' },
      { status: 500 }
    );
  }
} 
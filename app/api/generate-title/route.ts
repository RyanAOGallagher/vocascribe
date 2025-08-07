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

    const prompt = `Based on the following transcription, generate a concise and descriptive title (maximum 8 words) that captures the main topic or theme. Return only the title, nothing else.

Transcription:
${transcription}

Title:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const title = response.text?.trim() || 'Untitled';

    return NextResponse.json({ title });
  } catch (error) {
    console.error('Error generating title:', error);
    return NextResponse.json(
      { error: 'Failed to generate title' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import {
  createUserContent,
  createPartFromUri,
} from "@google/genai";
import { ai } from '../shared/gemini';

export async function POST(request: NextRequest) {
  try {
    console.log("Transcribe API called");
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const recordingDuration = formData.get('recordingDuration') as string;
    const isChunk = formData.get('isChunk') === 'true';
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    console.log("Processing audio file:", audioFile.name);
    console.log("Recording duration:", recordingDuration, "seconds");
    console.log("Is chunk:", isChunk);
    console.log("File size:", (audioFile.size / 1024 / 1024).toFixed(2), "MB");

    // Upload the audio file to Gemini
    const myfile = await ai.files.upload({
      file: audioFile,
      config: { mimeType: audioFile.type || 'audio/webm' },
    });

    console.log("File uploaded to Gemini");

    // Create the prompt for transcription
    const prompt = "Generate a transcript of this meeting. Do not include any other text.";
    
    const uri = myfile.uri || '';
    
    // Generate content with audio
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: createUserContent([
        createPartFromUri(uri, myfile.mimeType || 'audio/webm'),
        prompt,
      ]),
    });

    console.log("Transcription completed");

    // Check if this is a chunk to avoid duplicate key sentence extraction
    console.log("transcription", result.text);
    let keySentences = '';
    if (!isChunk) {
      // Extract key sentences from the transcript only for non-chunked audio
      const keySentencesResponse = await fetch(`${request.nextUrl.origin}/api/key-sentences`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcription: result.text }),
      });

      if (keySentencesResponse.ok) {
        const keySentencesData = await keySentencesResponse.json();
        keySentences = keySentencesData.keySentences;
        console.log("Key sentences extracted");
      } else {
        console.error("Failed to extract key sentences");
      }
    }

    return NextResponse.json({ 
      transcription: result.text,
      keySentences: keySentences
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
} 
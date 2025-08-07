import { NextRequest, NextResponse } from 'next/server';
import { createSession, getSessions, deleteSession, Session } from '../../database/sessions';

export async function POST(request: NextRequest) {
  try {
    const { title, transcription, keySentences, date } = await request.json();

    if (!title || !transcription) {
      return NextResponse.json(
        { error: 'Title and transcription are required' },
        { status: 400 }
      );
    }

    const session: Session = {
      title,
      transcription,
      key_sentences: keySentences,
      created_at: date || new Date().toISOString()
    };

    const savedSession = await createSession(session);

    return NextResponse.json({ 
      success: true, 
      session: savedSession 
    });
  } catch (error) {
    console.error('Error saving session:', error);
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sessions = await getSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
} 

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await deleteSession(id);

    return NextResponse.json({ 
      success: true, 
      message: 'Session deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    );
  }
} 
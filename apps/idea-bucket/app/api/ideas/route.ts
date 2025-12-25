import { NextRequest, NextResponse } from 'next/server';
import { createIdeaCard, processIdeaCard } from '@/lib/db';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { description, imageUrl } = body;

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Create idea card
    const idea = await createIdeaCard(description, imageUrl);

    // Process with AI in background (non-blocking)
    processIdeaCard(idea.id).catch((err) => {
      console.error('Failed to process idea with AI:', err);
    });

    return NextResponse.json({ idea }, { status: 201 });
  } catch (error) {
    console.error('Error creating idea:', error);
    return NextResponse.json(
      { error: 'Failed to create idea' },
      { status: 500 }
    );
  }
}

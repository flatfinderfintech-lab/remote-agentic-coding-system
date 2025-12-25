import { NextResponse } from 'next/server';
import { generateConceptClusters } from '@/lib/db';

export async function POST(): Promise<NextResponse> {
  try {
    const count = await generateConceptClusters();

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Error generating clusters:', error);
    return NextResponse.json(
      { error: 'Failed to generate clusters' },
      { status: 500 }
    );
  }
}

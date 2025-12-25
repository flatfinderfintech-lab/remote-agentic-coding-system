import { NextRequest, NextResponse } from 'next/server';
import { createSpecKitDraft } from '@/lib/db';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { clusterId } = body;

    if (!clusterId) {
      return NextResponse.json(
        { error: 'Cluster ID is required' },
        { status: 400 }
      );
    }

    const specKit = await createSpecKitDraft(clusterId);

    // Parse JSON fields for response
    const response = {
      specKit: {
        ...specKit,
        coreFeatures: JSON.parse(specKit.coreFeatures),
        sourceIdeaIds: JSON.parse(specKit.sourceIdeaIds),
      },
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error generating spec kit:', error);
    return NextResponse.json(
      { error: 'Failed to generate spec kit' },
      { status: 500 }
    );
  }
}

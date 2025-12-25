import { NextRequest, NextResponse } from 'next/server';
import { updateClusterStatus } from '@/lib/db';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { clusterId, status } = body;

    if (!clusterId || !status) {
      return NextResponse.json(
        { error: 'Cluster ID and status are required' },
        { status: 400 }
      );
    }

    if (status !== 'accepted' && status !== 'rejected') {
      return NextResponse.json(
        { error: 'Status must be "accepted" or "rejected"' },
        { status: 400 }
      );
    }

    await updateClusterStatus(clusterId, status);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error updating cluster status:', error);
    return NextResponse.json(
      { error: 'Failed to update cluster status' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { processAutoDeclineBookings } from '@/lib/cron';

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (in production, you might want to add auth)
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await processAutoDeclineBookings();
    
    if (result.success) {
      return NextResponse.json({ 
        message: 'Auto-decline process completed', 
        processed: result.processed 
      });
    } else {
      return NextResponse.json({ 
        error: 'Auto-decline process failed', 
        details: result.error 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Cron auto-decline API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
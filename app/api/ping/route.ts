import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * نقطة نهاية بسيطة للرد على استعلامات التحقق من الاتصال
 * تستخدم من قبل service-worker للتحقق من حالة الاتصال بالشبكة
 */
export async function GET() {
  return NextResponse.json(
    { 
      online: true,
      timestamp: new Date().toISOString()
    },
    { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    }
  );
}

/**
 * دعم CORS لاستدعاءات مسبقة
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 
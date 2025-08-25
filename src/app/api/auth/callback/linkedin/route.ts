import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  // Redirecionar para o handler do NextAuth
  const response = await auth.handleAuth(request as any, { providerId: 'linkedin' });
  return response;
}

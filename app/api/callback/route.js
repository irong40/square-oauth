import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    redirect('/success?error=' + (error || 'no_code'));
  }

  const clientId = process.env.SQUARE_APP_ID;
  const clientSecret = process.env.SQUARE_APP_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing SQUARE_APP_ID or SQUARE_APP_SECRET env vars');
    redirect('/success?error=missing_config');
  }

  const squareEnv = process.env.NEXT_PUBLIC_SQUARE_ENV || 'sandbox';
  const baseUrl = squareEnv === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';

  // Do all async work before calling redirect() — redirect() throws in Next.js
  // and must not be inside try/catch
  let redirectPath = '/success?error=request_failed';

  try {
    const response = await fetch(`${baseUrl}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Square-Version': '2024-01-18' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: 'authorization_code'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Square token exchange failed:', response.status, JSON.stringify(data));
      redirectPath = '/success?error=square_api_error';
    } else if (!data.access_token) {
      console.error('No access_token in response:', JSON.stringify(data));
      redirectPath = '/success?error=token_error';
    } else {
      // Token exchange succeeded — store in Supabase
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const { error: dbError } = await supabase
          .from('square_merchant_tokens')
          .upsert({
            merchant_id: data.merchant_id,
            access_token: data.access_token,
            refresh_token: data.refresh_token || '',
            token_type: data.token_type || 'bearer',
            expires_at: expiresAt.toISOString(),
            is_active: true,
            updated_at: new Date().toISOString(),
          }, { onConflict: 'merchant_id' });

        if (dbError) {
          console.error('Failed to store token in DB:', dbError);
          redirectPath = '/success?error=db_store_failed&merchant=' + encodeURIComponent(data.merchant_id || '');
        } else {
          redirectPath = '/success?status=connected&merchant=' + encodeURIComponent(data.merchant_id || '');
        }
      } else {
        console.error('Supabase credentials not configured - tokens not stored');
        redirectPath = '/success?status=connected&merchant=' + encodeURIComponent(data.merchant_id || '');
      }
    }
  } catch (err) {
    console.error('OAuth callback error:', err);
    redirectPath = '/success?error=request_failed';
  }

  redirect(redirectPath);
}

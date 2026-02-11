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
      console.error('Square token exchange failed:', response.status, data);
      redirect('/success?error=square_api_error');
    }

    if (data.access_token) {
      // Store tokens in Supabase
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Square OAuth tokens expire 30 days from grant
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
          redirect('/success?error=db_store_failed&merchant=' + encodeURIComponent(data.merchant_id || ''));
          return;
        }
      } else {
        console.error('Supabase credentials not configured - tokens not stored');
      }

      redirect('/success?status=connected&merchant=' + encodeURIComponent(data.merchant_id || ''));
    } else {
      redirect('/success?error=token_error');
    }
  } catch (err) {
    console.error('OAuth callback error:', err);
    redirect('/success?error=request_failed');
  }
}

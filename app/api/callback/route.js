import { redirect } from 'next/navigation';

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    redirect('/success?error=' + (error || 'no_code'));
  }

  const clientId = process.env.SQUARE_APP_ID;
  const clientSecret = process.env.SQUARE_APP_SECRET;

  try {
    const response = await fetch('https://connect.squareup.com/oauth2/token', {
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

    if (data.access_token) {
      redirect('/success?token=' + encodeURIComponent(data.access_token) + '&merchant=' + encodeURIComponent(data.merchant_id || ''));
    } else {
      redirect('/success?error=token_error');
    }
  } catch (err) {
    redirect('/success?error=request_failed');
  }
}
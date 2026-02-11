export default function Home() {
  const clientId = process.env.NEXT_PUBLIC_SQUARE_APP_ID;
  const squareEnv = process.env.NEXT_PUBLIC_SQUARE_ENV || 'sandbox';
  const baseUrl = squareEnv === 'production'
    ? 'https://connect.squareup.com'
    : 'https://connect.squareupsandbox.com';
  const scopes = 'ITEMS_READ+ITEMS_WRITE+ORDERS_READ+ORDERS_WRITE+CUSTOMERS_READ+MERCHANT_PROFILE_READ+PAYMENTS_READ+PAYMENTS_WRITE+INVENTORY_READ';
  const authUrl = `${baseUrl}/oauth2/authorize?client_id=${clientId}&scope=${scopes}&session=false`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '48px', borderRadius: '12px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', maxWidth: '500px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '12px' }}>Connect Your Square Account</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>Click below to authorize access to your Square account.</p>
        {squareEnv === 'sandbox' && (
          <p style={{ color: '#92400e', fontSize: '12px', marginBottom: '16px' }}>Sandbox Mode</p>
        )}
        <a href={authUrl} style={{ display: 'inline-block', backgroundColor: '#006AFF', color: 'white', padding: '16px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
          Authorize with Square
        </a>
      </div>
    </div>
  );
}

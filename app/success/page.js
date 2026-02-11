'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const errorMessages = {
  no_code: 'Authorization code was not received from Square.',
  token_error: 'Failed to obtain access token from Square.',
  request_failed: 'Could not communicate with Square. Please try again.',
  square_api_error: 'Square rejected the authorization request.',
  db_store_failed: 'Connected to Square but failed to save credentials. Please try again.',
  missing_config: 'Server is misconfigured. Contact the administrator.',
};

function SuccessContent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const merchant = searchParams.get('merchant');
  const error = searchParams.get('error');

  if (error) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <h1 style={{ color: '#DC3545' }}>Authorization Failed</h1>
        <p>{errorMessages[error] || 'An unknown error occurred.'}</p>
        <a href="/" style={{ color: '#006AFF', marginTop: '16px', display: 'inline-block' }}>Try Again</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '48px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: '#28A745' }}>Connected Successfully!</h1>
      {merchant && <p><strong>Merchant ID:</strong> {merchant}</p>}
      <p style={{ color: '#666', marginTop: '16px' }}>Your Square account has been connected and your credentials have been securely stored.</p>
      <p style={{ color: '#666', marginTop: '8px' }}>You can close this window.</p>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense fallback={<div>Loading...</div>}><SuccessContent /></Suspense>;
}

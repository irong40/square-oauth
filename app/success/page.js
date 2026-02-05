'use client';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const merchant = searchParams.get('merchant');
  const error = searchParams.get('error');

  if (error) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        <h1 style={{ color: '#DC3545' }}>Authorization Failed</h1>
        <p>Error: {error}</p>
        <a href="/">Try Again</a>
      </div>
    );
  }

  return (
    <div style={{ padding: '48px', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ color: '#28A745' }}>Success!</h1>
      {merchant && <p><strong>Merchant ID:</strong> {merchant}</p>}
      <p><strong>Access Token:</strong></p>
      <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '6px', fontFamily: 'monospace', wordBreak: 'break-all', fontSize: '12px' }}>{token}</div>
      <button onClick={() => { navigator.clipboard.writeText(token); alert('Copied!'); }} style={{ marginTop: '16px', background: '#2D5A3D', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Copy Token</button>
      <p style={{ color: '#DC3545', marginTop: '16px' }}>Save this token now!</p>
    </div>
  );
}

export default function SuccessPage() {
  return <Suspense fallback={<div>Loading...</div>}><SuccessContent /></Suspense>;
}
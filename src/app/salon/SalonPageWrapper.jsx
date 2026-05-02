'use client';

import dynamic from 'next/dynamic';

const SalonPageContent = dynamic(() => import('./SalonPage'), {
  ssr: false,
  loading: () => <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
});

export default function SalonPageWrapper() {
  return <SalonPageContent />;
}

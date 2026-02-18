'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Automatische Weiterleitung zur Desktop-Version
    router.push('/desktop');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4 mx-auto"></div>
        <p className="text-lg text-gray-600">Weiterleitung zur Desktop-Version...</p>
      </div>
    </div>
  );
}
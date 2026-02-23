'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to desktop version
    router.replace('/desktop');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-[#dfdfdfff] flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
        <p className="text-lg text-gray-600">Weiterleitung zur Distractor-App...</p>
      </div>
    </div>
  );
}
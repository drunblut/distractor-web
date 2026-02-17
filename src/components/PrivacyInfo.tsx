'use client';
import React, { useState, useEffect } from 'react';

export default function PrivacyInfo() {
  const [hasSeenInfo, setHasSeenInfo] = useState(true); // Default to true to avoid flash

  useEffect(() => {
    // Check if user has already seen the privacy info
    const seenInfo = localStorage.getItem('distractorAppPrivacyInfoSeen');
    if (!seenInfo) {
      setHasSeenInfo(false);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('distractorAppPrivacyInfoSeen', 'true');
    setHasSeenInfo(true);
  };

  if (hasSeenInfo) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50 max-w-md mx-auto md:left-auto md:right-4 md:max-w-sm">
      <div className="text-sm text-gray-700 mb-3">
        <p className="font-medium mb-2">Lokale Datenspeicherung</p>
        <p>
          Diese App speichert eine Session-ID lokal auf Ihrem Gerät, um die Funktionalität zu gewährleisten. 
          Es werden keine persönlichen Daten übertragen oder gespeichert.
        </p>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={handleAccept}
          className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
        >
          Verstanden
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Sie können diese Daten jederzeit durch Löschen der Browser-Daten entfernen.
      </p>
    </div>
  );
}
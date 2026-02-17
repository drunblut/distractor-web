'use client';

// Absolut minimale statische Version für Android-Test
export default function StaticAndroidTest() {
  return (
    <div className="min-h-screen bg-blue-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">
          📱 Android Test
        </h1>
        
        <div className="space-y-4">
          <div className="p-4 bg-green-100 rounded-lg">
            <h2 className="font-bold text-green-800">✅ React funktioniert</h2>
            <p className="text-green-700">Diese Seite lädt erfolgreich</p>
          </div>
          
          <div className="p-4 bg-blue-100 rounded-lg">
            <h2 className="font-bold text-blue-800">📱 Mobile-optimiert</h2>
            <p className="text-blue-700">Responsive Design aktiv</p>
          </div>
          
          <div className="p-4 bg-yellow-100 rounded-lg">
            <h2 className="font-bold text-yellow-800">⚡ Minimal</h2>
            <p className="text-yellow-700">Keine komplexen Abhängigkeiten</p>
          </div>
          
          <button 
            onClick={() => alert('Android-Test erfolgreich!')}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold"
          >
            Test-Button klicken
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Timestamp: {new Date().toLocaleString()}</p>
          <p>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 50) + '...' : 'Server'}</p>
        </div>
      </div>
    </div>
  );
}
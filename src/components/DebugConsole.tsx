'use client';
import React, { useState, useEffect } from 'react';

interface DebugLog {
  timestamp: string;
  message: string;
  type: 'PHASE' | 'NAV' | 'CHECKPOINT' | 'TIMER' | 'INIT' | 'ERROR' | 'OTHER';
}

interface DebugConsoleProps {
  isVisible: boolean;
  onToggle: () => void;
}

export default function DebugConsole({ isVisible, onToggle }: DebugConsoleProps) {
  const [logs, setLogs] = useState<DebugLog[]>([]);

  useEffect(() => {
    // Store original console.log
    const originalLog = console.log;
    
    // Override console.log
    console.log = (...args: any[]) => {
      // Call original console.log first
      originalLog.apply(console, args);
      
      // Process debug messages asynchronously to avoid React state update issues
      setTimeout(() => {
        const message = args.join(' ');
        if (message.includes('[') && message.includes('DEBUG]')) {
          const timestamp = new Date().toLocaleTimeString();
          let type: DebugLog['type'] = 'OTHER';
          
          if (message.includes('[PHASE DEBUG]')) type = 'PHASE';
          else if (message.includes('[NAV DEBUG]')) type = 'NAV';
          else if (message.includes('[CHECKPOINT DEBUG]')) type = 'CHECKPOINT';
          else if (message.includes('[TIMER DEBUG]')) type = 'TIMER';
          else if (message.includes('[INIT DEBUG]')) type = 'INIT';
          
          setLogs(prev => {
            const newLogs = [...prev, { timestamp, message, type }];
            // Keep only last 50 logs
            return newLogs.slice(-50);
          });
        }
      }, 0);
    };

    // Cleanup function
    return () => {
      console.log = originalLog;
    };
  }, []);

  const getTypeColor = (type: DebugLog['type']) => {
    switch (type) {
      case 'PHASE': return 'text-blue-600 bg-blue-50';
      case 'NAV': return 'text-green-600 bg-green-50';
      case 'CHECKPOINT': return 'text-orange-600 bg-orange-50';
      case 'TIMER': return 'text-purple-600 bg-purple-50';
      case 'INIT': return 'text-gray-600 bg-gray-50';
      case 'ERROR': return 'text-red-600 bg-red-50';
      default: return 'text-black bg-white';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 left-4 bg-gray-800 text-white px-3 py-2 rounded-lg z-50 text-xs"
      >
        Show Debug ({logs.length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white border-2 border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
      <div className="bg-gray-800 text-white px-3 py-2 flex justify-between items-center">
        <span className="text-sm font-bold">Debug Console ({logs.length})</span>
        <div className="flex gap-2">
          <button
            onClick={() => setLogs([])}
            className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded"
          >
            Clear
          </button>
          <button
            onClick={onToggle}
            className="text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
          >
            Hide
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-48 p-2">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-xs text-center py-4">
            Waiting for debug messages...
          </div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`text-xs p-1 mb-1 rounded border-l-2 ${getTypeColor(log.type)}`}>
              <div className="flex gap-2">
                <span className="font-mono text-gray-500 whitespace-nowrap">{log.timestamp}</span>
                <span className="break-all">{log.message}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
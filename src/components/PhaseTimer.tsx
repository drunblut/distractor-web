'use client';
import React, { useContext, useState, useEffect } from 'react';
import { GlobalContext } from '../context/GlobalContext';

export default function PhaseTimer() {
  const contextValue = useContext(GlobalContext);
  const { phaseTimer, currentPhase, isPhaseActive, currentTask, currentTaskIndex, taskQueue } = contextValue || {};
  
  // Local timer state that updates every second for smooth display
  const [displayTimer, setDisplayTimer] = useState(phaseTimer || 0);

  // Sync with context timer when it changes (e.g., phase transitions)
  useEffect(() => {
    if (phaseTimer !== undefined) {
      setDisplayTimer(phaseTimer);
    }
  }, [phaseTimer]);

  // Local countdown that runs independently for smooth display
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isPhaseActive && displayTimer > 0) {
      interval = setInterval(() => {
        setDisplayTimer(prev => {
          const newTime = prev - 1;
          return newTime <= 0 ? 0 : newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPhaseActive, displayTimer]);

  // Debug logging for timer issues
  React.useEffect(() => {
    if (currentPhase === 2 && displayTimer === 0) {
      console.log(`[TIMER UI DEBUG] Phase 2 timer at 0 - Task: ${currentTask}, Index: ${currentTaskIndex}, Queue Length: ${taskQueue?.length}`);
    }
  }, [displayTimer, currentPhase, currentTask, currentTaskIndex, taskQueue]);

  if (!isPhaseActive) {
    return (
      <div className="fixed top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50">
        <div className="text-sm font-bold">Completed!</div>
      </div>
    );
  }

  const minutes = Math.floor((displayTimer || 0) / 60);
  const seconds = (displayTimer || 0) % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  // Color coding based on remaining time
  const getTimerColor = () => {
    if (displayTimer === undefined) return 'bg-gray-800';
    
    if (displayTimer <= 10) return 'bg-red-600'; // Last 10 seconds - red
    if (displayTimer <= 30) return 'bg-orange-600'; // Last 30 seconds - orange
    return 'bg-blue-600'; // Normal - blue
  };

  return (
    <div className={`fixed top-4 right-4 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-colors duration-300 ${getTimerColor()}`}>
      <div className="text-xs opacity-80">Phase {currentPhase}</div>
      <div className="text-lg font-bold font-mono">{timeString}</div>
    </div>
  );
}
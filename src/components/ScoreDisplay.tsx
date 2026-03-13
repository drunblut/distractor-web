import React from 'react';
import { useGlobalContext } from '../context/GlobalContext';

interface ScoreDisplayProps {
  className?: string;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ className = "" }) => {
  const { totalPoints, currentPhase } = useGlobalContext();

  // Punkte-Anzeige unsichtbar gemacht
  return null;
};

export default ScoreDisplay;
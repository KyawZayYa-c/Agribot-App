// hooks/useControlState.js
import { useState } from 'react';

export const useControlState = () => {
  const [autoMode, setAutoMode] = useState(true);
  const [ploughing, setPloughing] = useState(true);
  const [seedDropper, setSeedDropper] = useState(true);
  const [soilCoverer, setSoilCoverer] = useState(false);
  const [speed, setSpeed] = useState(60);
  const [estimatedTime, setEstimatedTime] = useState('12 mins');

  const toggleAutoMode = () => setAutoMode(prev => !prev);
  const togglePloughing = () => setPloughing(prev => !prev);
  const toggleSeedDropper = () => setSeedDropper(prev => !prev);
  const toggleSoilCoverer = () => setSoilCoverer(prev => !prev);

  const increaseSpeed = () => setSpeed(prev => Math.min(prev + 5, 100));
  const decreaseSpeed = () => setSpeed(prev => Math.max(prev - 5, 0));

  return {
    autoMode,
    ploughing,
    seedDropper,
    soilCoverer,
    speed,
    estimatedTime,
    toggleAutoMode,
    togglePloughing,
    toggleSeedDropper,
    toggleSoilCoverer,
    increaseSpeed,
    decreaseSpeed,
    setEstimatedTime,
  };
};
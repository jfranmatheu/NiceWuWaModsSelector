import { useState, useEffect } from 'react';

export default function useGameDetection(templatePath, checkInterval = 1000) {
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isScreenDetected, setIsScreenDetected] = useState(false);

  useEffect(() => {
    let intervalId;

    const checkGameStatus = async () => {
      try {
        // Check if game is running and active
        const statusResponse = await fetch('http://localhost:8000/api/game/status');
        const status = await statusResponse.json();
        
        setIsGameRunning(status.is_running);
        setIsGameActive(status.is_active);

        // If game is running and active, check for specific screen
        if (status.is_running && status.is_active) {
          const detectResponse = await fetch('http://localhost:8000/api/game/detect-screen', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ template_path: templatePath }),
          });
          const { detected } = await detectResponse.json();
          setIsScreenDetected(detected);
        } else {
          setIsScreenDetected(false);
        }
      } catch (error) {
        console.error('Error checking game status:', error);
        setIsGameRunning(false);
        setIsGameActive(false);
        setIsScreenDetected(false);
      }
    };

    // Initial check
    checkGameStatus();

    // Set up interval for periodic checks
    intervalId = setInterval(checkGameStatus, checkInterval);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [templatePath, checkInterval]);

  return {
    isGameRunning,
    isGameActive,
    isScreenDetected,
  };
} 
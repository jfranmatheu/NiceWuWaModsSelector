'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function GameOverlay({ isVisible, children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-black/50 backdrop-blur-sm p-4 rounded-lg pointer-events-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
} 
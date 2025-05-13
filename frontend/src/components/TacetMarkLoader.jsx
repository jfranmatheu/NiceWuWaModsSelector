import React, { useRef, useEffect } from 'react';

export default function TacetMarkLoader({ size = 80 }) {
  const turbRef = useRef(null);

  // Animate the wave
  useEffect(() => {
    let frame = 0;
    let running = true;
    function animate() {
      if (turbRef.current) {
        // Animate the phase of the turbulence for horizontal movement
        turbRef.current.setAttribute('seed', (2 + Math.sin(frame / 40) * 2).toString());
      }
      frame++;
      if (running) requestAnimationFrame(animate);
    }
    animate();
    return () => { running = false; };
  }, []);

  return (
    <div className="flex items-center justify-center">
      <svg width={size} height={size} style={{ display: 'block' }}>
        <defs>
          <filter id="wave" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              ref={turbRef}
              type="turbulence"
              baseFrequency="0.02 0.002"
              numOctaves="4"
              seed="2"
              result="turb"
            />
            <feDisplacementMap
              in2="turb"
              in="SourceGraphic"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="A"
            />
          </filter>
        </defs>
        <image
          href="/tacet_mark.png"
          width={size}
          height={size}
          style={{
            filter: 'url(#wave)'
          }}
        />
      </svg>

    </div>
  );
}

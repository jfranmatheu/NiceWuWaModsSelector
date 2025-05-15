import React from 'react';

export default function TacetMarkLoader({ size = 160, useSvg = false }) {
  return (
    <div className="flex items-center justify-center">
      {useSvg ? (
        <svg width={size} height={size} viewBox="0 0 160 160" style={{ display: 'block' }}>
          <defs>
            <filter id="glitch" x="0" y="0" width="200%" height="200%">
              <feFlood flood-color="black" result="black" />
              <feFlood flood-color="red" result="flood1" />
              <feFlood flood-color="limegreen" result="flood2" />
              <feOffset in="SourceGraphic" dx="3" dy="0" result="off1a" />
              <feOffset in="SourceGraphic" dx="2" dy="0" result="off1b" />
              <feOffset in="SourceGraphic" dx="-3" dy="0" result="off2a" />
              <feOffset in="SourceGraphic" dx="-2" dy="0" result="off2b" />
              <feComposite in="flood1" in2="off1a" operator="in" result="comp1" />
              <feComposite in="flood2" in2="off2a" operator="in" result="comp2" />
              <feMerge x="0" width="100%" result="merge1">
                <feMergeNode in="black" />
                <feMergeNode in="comp1" />
                <feMergeNode in="off1b" />
                <animate attributeName="y" id="y" dur="4s" values="104px; 104px; 30px; 105px; 30px; 2px; 2px; 50px; 40px; 105px; 105px; 20px; 60px; 40px; 104px; 40px; 70px; 10px; 30px; 104px; 102px" keyTimes="0; 0.362; 0.368; 0.421; 0.440; 0.477; 0.518; 0.564; 0.593; 0.613; 0.644; 0.693; 0.721; 0.736; 0.772; 0.818; 0.844; 0.894; 0.925; 0.939; 1" repeatCount="indefinite" />
                <animate attributeName="height" id="h" dur="4s" values="10px; 0px; 10px; 30px; 50px; 0px; 10px; 0px; 0px; 0px; 10px; 50px; 40px; 0px; 0px; 0px; 40px; 30px; 10px; 0px; 50px" keyTimes="0; 0.362; 0.368; 0.421; 0.440; 0.477; 0.518; 0.564; 0.593; 0.613; 0.644; 0.693; 0.721; 0.736; 0.772; 0.818; 0.844; 0.894; 0.925; 0.939; 1" repeatCount="indefinite" />
              </feMerge>
              <feMerge x="0" width="100%" y="60px" height="65px" result="merge2">
                <feMergeNode in="black" />
                <feMergeNode in="comp2" />
                <feMergeNode in="off2b" />
                <animate attributeName="y" id="y" dur="4s" values="103px; 104px; 69px; 53px; 42px; 104px; 78px; 89px; 96px; 100px; 67px; 50px; 96px; 66px; 88px; 42px; 13px; 100px; 100px; 104px;" keyTimes="0; 0.055; 0.100; 0.125; 0.159; 0.182; 0.202; 0.236; 0.268; 0.326; 0.357; 0.400; 0.408; 0.461; 0.493; 0.513; 0.548; 0.577; 0.613; 1" repeatCount="indefinite" />
                <animate attributeName="height" id="h" dur="4s" values="0px; 0px; 0px; 16px; 16px; 12px; 12px; 0px; 0px; 5px; 10px; 22px; 33px; 11px; 0px; 0px; 10px" keyTimes="0; 0.055; 0.100; 0.125; 0.159; 0.182; 0.202; 0.236; 0.268; 0.326; 0.357; 0.400; 0.408; 0.461; 0.493; 0.513; 1" repeatCount="indefinite" />
              </feMerge>
              <feMerge>
                <feMergeNode in="SourceGraphic" />
                <feMergeNode in="merge1" />
                <feMergeNode in="merge2" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#glitch)">
            <g transform="translate(0,160) scale(0.05,-0.05)" fill="#ffffff" stroke="none">
              <path d="M1583 2865 c-12 -52 -35 -239 -52 -416 -54 -572 -112 -673 -391 -686
-203 -9 -250 28 -271 212 -24 215 -91 227 -131 24 -37 -191 -83 -232 -278
-249 -158 -14 -160 -15 -160 -69 0 -55 3 -56 162 -73 l163 -18 45 -160 c26
-88 56 -239 68 -336 24 -205 31 -221 80 -195 31 17 39 58 50 275 21 387 43
426 241 426 205 0 303 -64 360 -236 26 -80 90 -827 91 -1070 0 -50 7 -56 55
-50 l55 6 14 264 c8 145 24 300 35 344 12 44 30 182 39 306 29 374 69 422 349
433 l185 7 53 -177 c29 -97 60 -256 67 -353 11 -143 19 -175 45 -170 40 8 55
71 91 386 34 291 40 301 190 320 299 39 310 140 16 148 -124 3 -181 58 -224
215 -70 253 -87 258 -137 32 -49 -221 -71 -245 -226 -245 -287 0 -341 67 -426
530 -13 66 -31 161 -41 210 -9 50 -18 173 -19 275 -1 222 -57 273 -98 90z"/>
            </g>
          </g>
        </svg>
      ) : (
        <img 
          src="/tacet_mark_anim.png" 
          width={size} 
          height={size} 
          alt="Tacet Mark Loader"
          className="rounded-full" // loader-blend loader-glow
        />
      )}
    </div>
  );
}

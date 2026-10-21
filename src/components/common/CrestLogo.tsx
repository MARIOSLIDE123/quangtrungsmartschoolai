import React from 'react';

export const CrestLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  return (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer Shield with Navy and Gold stroke */}
      <path
        d="M50 5 L88 18 V50 C88 74 50 95 50 95 C50 95 12 74 12 50 V18 L50 5 Z"
        fill="#142B4A"
        stroke="#F59E0B"
        strokeWidth="3.5"
      />
      {/* Inner Shield border */}
      <path
        d="M50 12 L82 23 V49 C82 69 50 88 50 88 C50 88 18 69 18 49 V23 L50 12 Z"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1.5"
        fill="#1E3A5F"
      />
      {/* Golden Star at top */}
      <polygon
        points="50,22 53,30 61,30 55,35 57,43 50,38 43,43 45,35 39,30 47,30"
        fill="#F59E0B"
      />
      {/* Open Book symbol of knowledge */}
      <path
        d="M50 58 C44 54 36 54 28 56 V72 C36 70 44 70 50 74 C56 70 64 70 72 72 V56 C64 54 56 54 50 58 Z"
        fill="#FFFFFF"
      />
      {/* Book center spine line */}
      <line x1="50" y1="58" x2="50" y2="74" stroke="#142B4A" strokeWidth="2" strokeLinecap="round" />
      {/* Digital AI circuit sparks */}
      <circle cx="34" cy="46" r="2.5" fill="#38BDF8" />
      <circle cx="66" cy="46" r="2.5" fill="#38BDF8" />
      <path d="M34 46 L42 46 L47 50" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M66 46 L58 46 L53 50" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

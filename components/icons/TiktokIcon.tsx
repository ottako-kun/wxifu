import React from 'react';

const XVIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <text
      x="50%"
      y="50%"
      dominantBaseline="middle"
      textAnchor="middle"
      fontFamily="Arial, Helvetica, sans-serif"
      fontWeight="900"
      fontSize="16"  // increased from 12 → 16
    >
      XV
    </text>
  </svg>
);

export default XVIcon;

import React from 'react';

const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.195.025.39.044.588.056l4.246 2.123a2.25 2.25 0 10.384 4.506l-4.246-2.123a2.25 2.25 0 00-.384-4.506m0-2.186l4.246-2.123a2.25 2.25 0 10-.384-4.506l-4.246 2.123a2.25 2.25 0 00.384 4.506z"
    />
  </svg>
);

export default ShareIcon;

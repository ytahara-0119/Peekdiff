export function AppIcon({ size = 512 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="50%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="moon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FDE68A" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FDE68A" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Background */}
      <rect width="512" height="512" rx="128" fill="url(#bg-gradient)" />

      {/* Decorative circles */}
      <g opacity="0.15">
        <circle cx="140" cy="140" r="80" fill="white" />
        <circle cx="372" cy="372" r="60" fill="white" />
        <circle cx="400" cy="150" r="40" fill="white" />
      </g>

      {/* Moon */}
      <g transform="translate(256, 180)">
        <circle r="100" fill="url(#glow)" />
        <circle r="90" fill="url(#moon-gradient)" />
        <circle cx="30" cy="-20" r="80" fill="#9333EA" opacity="0.3" />
        <circle cx="15" cy="25" r="12" fill="#D97706" opacity="0.2" />
        <circle cx="-25" cy="-15" r="18" fill="#D97706" opacity="0.2" />
        <circle cx="35" cy="35" r="10" fill="#D97706" opacity="0.15" />
      </g>

      {/* Stars */}
      <g transform="translate(150, 100)">
        <path d="M0,-20 L5,-6 L20,-6 L8,3 L13,17 L0,8 L-13,17 L-8,3 L-20,-6 L-5,-6 Z" fill="#FDE68A" opacity="0.9" />
      </g>
      <g transform="translate(380, 280)">
        <path d="M0,-15 L4,-5 L15,-5 L6,2 L10,13 L0,6 L-10,13 L-6,2 L-15,-5 L-4,-5 Z" fill="#FEF3C7" opacity="0.85" />
      </g>
      <g transform="translate(100, 380)">
        <path d="M0,-12 L3,-4 L12,-4 L5,1 L8,10 L0,5 L-8,10 L-5,1 L-12,-4 L-3,-4 Z" fill="#FBBF24" opacity="0.8" />
      </g>
      <g transform="translate(420, 120)">
        <path d="M0,-10 L2.5,-3 L10,-3 L4,1 L6.5,8 L0,4 L-6.5,8 L-4,1 L-10,-3 L-2.5,-3 Z" fill="#FDE68A" opacity="0.7" />
      </g>
      <g transform="translate(180, 400)">
        <path d="M0,-8 L2,-2 L8,-2 L3,1 L5,7 L0,3 L-5,7 L-3,1 L-8,-2 L-2,-2 Z" fill="#FEF3C7" opacity="0.6" />
      </g>
      <g transform="translate(350, 420)">
        <path d="M0,-10 L2.5,-3 L10,-3 L4,1 L6.5,8 L0,4 L-6.5,8 L-4,1 L-10,-3 L-2.5,-3 Z" fill="#FBBF24" opacity="0.75" />
      </g>
    </svg>
  );
}

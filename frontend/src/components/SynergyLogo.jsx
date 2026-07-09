import { Box } from '@mui/material';

const SynergyLogo = ({ size = 32, sx = {} }) => {
  return (
    <Box
      component="svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      sx={{
        display: 'block',
        ...sx
      }}
    >
      <defs>
        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="cobaltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <path
        d="M 30,50 C 30,35 45,20 60,20 C 75,20 80,35 70,45 C 60,55 40,45 30,55 C 20,65 25,80 40,80 C 55,80 70,65 70,50"
        fill="none"
        stroke="url(#emeraldGrad)"
        strokeWidth="10"
        strokeLinecap="round"
      />
      <path
        d="M 70,50 C 70,65 55,80 40,80 C 25,80 20,65 30,55 C 40,45 60,55 70,45 C 80,35 75,20 60,20 C 45,20 30,35 30,50"
        fill="none"
        stroke="url(#cobaltGrad)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="4 8"
        opacity="0.85"
      />
    </Box>
  );
};

export default SynergyLogo;

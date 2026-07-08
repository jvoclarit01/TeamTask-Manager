import { Box, Typography, Link, Container } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 3, 
        mt: 'auto', 
        borderTop: '1px solid #1e293b', 
        background: 'rgba(3, 7, 18, 0.4)',
        textAlign: 'center'
      }}
    >
      <Container maxWidth="lg" sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.8rem', fontFamily: '"Fira Code", monospace' }}>
          © {new Date().getFullYear()} Workload Hub. All rights reserved.
        </Typography>
        <Box sx={{ display: 'flex', gap: 3 }}>
          <Link href="#" underline="hover" sx={{ color: '#475569', fontSize: '0.8rem', '&:hover': { color: '#94a3b8' } }}>
            Privacy Policy
          </Link>
          <Link href="#" underline="hover" sx={{ color: '#475569', fontSize: '0.8rem', '&:hover': { color: '#94a3b8' } }}>
            Terms of Service
          </Link>
          <Link href="#" underline="hover" sx={{ color: '#475569', fontSize: '0.8rem', '&:hover': { color: '#94a3b8' } }}>
            Support
          </Link>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

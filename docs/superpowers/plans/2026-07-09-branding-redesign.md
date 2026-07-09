# Branding Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate the visual brand identity system (monogram SVG, tagline, dark-refractive asset background, and dynamic welcome card overlay) into the main web application on the `feature/branding-integration` branch.

---

### Task 1: Create SynergyLogo.jsx Component

**Files:**
- Create: `frontend/src/components/SynergyLogo.jsx`

- [ ] **Step 1: Write SynergyLogo SVG markup**
  Implement the modular interlocking double loop monogram in SVG format inside `frontend/src/components/SynergyLogo.jsx`:
  ```jsx
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
        {/* Interlocking geometric loops representing aligned flow */}
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
  ```

- [ ] **Step 2: Commit SynergyLogo**
  Run:
  ```bash
  git add frontend/src/components/SynergyLogo.jsx
  git commit -m "feat: implement geometric interlocking SynergyLogo SVG component"
  ```

---

### Task 2: Create WelcomeOverlay.jsx Component

**Files:**
- Create: `frontend/src/components/WelcomeOverlay.jsx`

- [ ] **Step 1: Write welcome overlay UI and logic**
  Implement the fullscreen glassmorphic welcome overlay component that automatically fades out after 1.5 seconds:
  ```jsx
  import { useEffect, useState } from 'react';
  import { Box, Typography } from '@mui/material';
  import SynergyLogo from './SynergyLogo';

  const WelcomeOverlay = ({ user, onClose }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
      const timer = setTimeout(() => {
        setVisible(false);
        // Wait for fade animation (300ms) to close completely
        const closeTimer = setTimeout(onClose, 300);
        return () => clearTimeout(closeTimer);
      }, 1500);

      return () => clearTimeout(timer);
    }, [onClose]);

    if (!user) return null;

    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'radial-gradient(circle at center, rgba(5, 8, 17, 0.9) 0%, rgba(3, 7, 18, 0.98) 100%)',
          backgroundImage: 'linear-gradient(to bottom, rgba(5, 8, 17, 0.85), rgba(3, 7, 18, 0.95)), url("/src/assets/brand_bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backdropFilter: 'blur(20px)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '@keyframes scaleIn': {
              '0%': { transform: 'scale(0.9)', opacity: 0 },
              '100%': { transform: 'scale(1)', opacity: 1 }
            }
          }}
        >
          <SynergyLogo size={90} sx={{ mb: 3, filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.2))' }} />

          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              fontFamily: '"Outfit", sans-serif',
              letterSpacing: '3px',
              background: 'linear-gradient(to right, #10b981, #3b82f6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1
            }}
          >
            SYNERGY
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: '#94a3b8',
              fontFamily: '"Fira Code", monospace',
              letterSpacing: '5px',
              display: 'block',
              mb: 4,
              textTransform: 'uppercase',
              fontSize: '0.75rem'
            }}
          >
            ALIGN. EXECUTE. SCALE.
          </Typography>

          <Box
            sx={{
              py: 1,
              px: 3,
              borderRadius: '20px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(5px)',
            }}
          >
            <Typography variant="body2" sx={{ color: '#cbd5e1', fontWeight: 600 }}>
              Welcome back, <span style={{ color: '#f8fafc', fontWeight: 800 }}>{user.name}</span>
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem', textTransform: 'capitalize', display: 'block', mt: 0.2 }}>
              Active Role: {user.role === 'admin' ? 'Administrator' : 'Team Member'}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  export default WelcomeOverlay;
  ```

- [ ] **Step 2: Commit WelcomeOverlay**
  Run:
  ```bash
  git add frontend/src/components/WelcomeOverlay.jsx
  git commit -m "feat: implement animated glassmorphic WelcomeOverlay component"
  ```

---

### Task 3: Integrate Welcome Overlay and Sidebar REDESIGN (App.jsx)

**Files:**
- Modify: `frontend/src/App.jsx`

- [ ] **Step 1: Wire welcome state and drawer background in App.jsx**
  Import `<SynergyLogo>` and `<WelcomeOverlay>`. Expose state to toggle welcome overlay when a user switch triggers. Redesign Left Sidebar drawer styles to render logo and use the `brand_bg.jpg` visual overlay.
  Inside `SidebarAndHeaderLayout` (App.jsx):
  - Add state: `const [showWelcome, setShowWelcome] = useState(false);`
  - When profile switch triggers in `handleUserSwitch`:
    ```javascript
    const handleUserSwitch = (selectedUser) => {
      switchUser(selectedUser);
      setAnchorEl(null);
      setShowWelcome(true);
    };
    ```
  - Trigger `showWelcome` on initial load (in a `useEffect` on mount if user is present).
  - Replace gradient Box with `<SynergyLogo size={32} />`.
  - Update Drawer paper style overrides to integrate the background image:
    ```javascript
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              background: 'linear-gradient(to bottom, rgba(9, 13, 22, 0.95), rgba(9, 13, 22, 0.98)), url("/src/assets/brand_bg.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'left center',
              borderRight: '1px solid #141b2d',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              py: 3,
              px: 2,
            },
    ```

- [ ] **Step 2: Commit App.jsx updates**
  Run:
  ```bash
  git add frontend/src/App.jsx
  git commit -m "feat: integrate logo component, welcome overlay trigger, and sidebar brand background in App.jsx"
  ```

---

### Task 4: Task Card Badges Integration (TaskCard.jsx)

**Files:**
- Modify: `frontend/src/components/TaskCard.jsx`

- [ ] **Step 1: Add miniature monogram badge in card header**
  Import `<SynergyLogo>` in `TaskCard.jsx`.
  In `TaskCard.jsx` render monogram badge in heading section:
  ```jsx
  import SynergyLogo from './SynergyLogo';
  ```
  And inside the task identifier box:
  ```jsx
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SynergyLogo size={14} sx={{ opacity: 0.85 }} />
              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 'bold', fontFamily: '"Fira Code", monospace' }}>
                TSK-{task.id}
              </Typography>
            </Box>
  ```

- [ ] **Step 2: Commit TaskCard updates**
  Run:
  ```bash
  git add frontend/src/components/TaskCard.jsx
  git commit -m "feat: render miniature brand monogram logo badge on TaskCard headers"
  ```

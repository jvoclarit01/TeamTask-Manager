# Design Specification: Synergy HRMS Branding Integration

This document defines the visual redesign standards for integrating the brand kit into the web application on the `feature/branding-integration` branch.

---

## 1. Geometric SVG Monogram (`SynergyLogo.jsx`)

Create a modular component to render the custom interlocking monogram.

*   **File Location**: `frontend/src/components/SynergyLogo.jsx`
*   **Vector Geometry**:
    *   An interlocking double loop.
    *   Path 1: Styled with primary color (`#10b981`, Emerald).
    *   Path 2: Styled with secondary color (`#3b82f6`, Cobalt).
    *   Includes an inline gradient mask.

---

## 2. Animated Welcome Overlay (`WelcomeOverlay.jsx`)

An animated fullscreen overlay rendered on initial load or user switches.

*   **File Location**: `frontend/src/components/WelcomeOverlay.jsx`
*   **Visual Structure**:
    *   Fullscreen overlay with a blurred backdrop: `backdrop-filter: blur(30px) saturate(180%)`.
    *   Slightly transparent overlay with the `brand_bg.jpg` texture blended as a soft background overlay.
    *   Centered Box featuring:
        *   `<SynergyLogo size={80} />` animating in with scale and opacity transitions.
        *   Wordmark `SYNERGY WORKLOAD MANAGER` (Outfit Bold font, large tracking).
        *   Tagline `ALIGN. EXECUTE. SCALE.` (Monospace font, high-contrast).
        *   Dynamic message: `Welcome back, [User Name] ([User Role])`.
*   **State Trigger**:
    *   Triggers when active user session updates or switches.
    *   Fades out automatically after 1.5 seconds.

---

## 3. Sidebar Integration (`App.jsx`)

*   **Logo Area**: Replace the placeholder `Box` with the `<SynergyLogo size={32} />` component.
*   **Background Detail**: Set the Sidebar drawer paper background to overlay `brand_bg.jpg` blended with a linear dark gradient:
    ```css
    background: 'linear-gradient(to bottom, rgba(9, 13, 22, 0.95), rgba(9, 13, 22, 0.98)), url("/src/assets/brand_bg.jpg")'
    ```

---

## 4. Task Card Branding Badges (`TaskCard.jsx`)

*   **Task Code Header**:
    Render `<SynergyLogo size={14} />` directly next to the task indicator label (e.g. `TSK-102`) to brand individual cards.

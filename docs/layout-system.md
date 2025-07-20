# Mobile-First Responsive Layout System

This document describes the new mobile-first responsive layout system implemented using CSS Grid with named areas and CSS modules.

## Overview

The layout system has been completely rewritten to address mobile responsiveness issues including:
- Content hidden beneath bottom bars
- Poor max height handling on mobile devices
- Lack of consistent spacing and responsive behavior
- No support for safe areas on devices with notches

## Core Components

### Layout.tsx
The main layout component using CSS Grid with named areas:
- **Mobile-first**: Uses CSS Grid with responsive breakpoints
- **Safe areas**: Supports devices with notches and dynamic islands
- **Sidebar**: Responsive sidebar with overlay on mobile, fixed position on desktop
- **Header/Main/Footer**: Flexible grid areas for any content structure

### Layout.module.css
CSS Module providing:
- **Named grid areas**: `header`, `main`, `footer`, `sidebar-desktop`
- **Responsive breakpoints**: Mobile-first approach with tablet and desktop variants
- **Safe area support**: Using `env(safe-area-inset-*)` for modern devices
- **Utility classes**: Common patterns like centering, flexbox, spacing

### LayoutComponents.tsx
React components that leverage the grid system:
- **GameLayout**: Game-specific layout with header, content, and actions areas
- **CenterLayout**: Centered content for loading screens, home page
- **FormLayout**: Consistent form styling with max-width and spacing
- **FlexBox**: Flexible box layout with common flex properties
- **SafeArea**: Safe area wrapper for devices with notches

## Key Features

### Mobile-First Design
```css
/* Mobile by default */
.layout {
  grid-template-areas:
    "header"
    "main"
    "footer";
}

/* Tablet and up */
@media (min-width: 768px) {
  .layout {
    grid-template-areas:
      "sidebar-desktop header header"
      "sidebar-desktop main main"
      "sidebar-desktop footer footer";
  }
}
```

### Safe Area Support
Automatically handles devices with notches:
```css
.safeBottom {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

### Dynamic Viewport Height
Uses `100dvh` instead of `100vh` for better mobile browser support:
```css
.layout {
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height */
}
```

### Responsive Sidebar
- **Mobile**: Overlay with backdrop and slide animation
- **Desktop**: Fixed sidebar when enabled
- **Accessibility**: Keyboard navigation, focus management, screen reader support

## Usage Examples

### Basic Page Layout
```tsx
import Layout from "@/components/Layout";
import { CenterLayout } from "@/components/LayoutComponents";

function HomePage() {
  return (
    <Layout>
      <CenterLayout>
        <h1>Welcome</h1>
        <p>Your content here</p>
      </CenterLayout>
    </Layout>
  );
}
```

### Game Layout
```tsx
import Layout from "@/components/Layout";
import { GameLayout, GameHeader, GameContent, GameActions } from "@/components/LayoutComponents";

function GamePage() {
  return (
    <Layout showSidebar={true}>
      <GameLayout>
        <GameHeader>
          <h1>Game Title</h1>
        </GameHeader>
        <GameContent>
          <p>Game content here</p>
        </GameContent>
        <GameActions>
          <button>Submit</button>
        </GameActions>
      </GameLayout>
    </Layout>
  );
}
```

### Form Layout
```tsx
import Layout from "@/components/Layout";
import { FormLayout } from "@/components/LayoutComponents";

function LoginPage() {
  return (
    <Layout>
      <FormLayout>
        <input type="text" placeholder="Username" />
        <input type="password" placeholder="Password" />
        <button>Login</button>
      </FormLayout>
    </Layout>
  );
}
```

## Global Styles

### Mobile Optimization
- Prevents horizontal scrolling
- Improves font rendering on mobile devices
- Better touch responsiveness
- Proper viewport configuration
- Minimum touch target sizes (44px on mobile)

### Accessibility
- Better focus visibility
- Reduced motion support
- Screen reader improvements
- Keyboard navigation support

### Performance
- CSS Grid for efficient layouts
- Reduced reliance on JavaScript for layout
- Better paint and layout performance
- Smooth scrolling with fallbacks

## Migration Guide

### From Mantine AppShell
**Before:**
```tsx
<AppShell>
  <AppShell.Header>Header</AppShell.Header>
  <AppShell.Main>Content</AppShell.Main>
</AppShell>
```

**After:**
```tsx
<Layout>
  <CenterLayout>Content</CenterLayout>
</Layout>
```

### From Manual Flex Layouts
**Before:**
```tsx
<Box style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
  <Box style={{ flex: 1 }}>Content</Box>
</Box>
```

**After:**
```tsx
<Layout>
  <div className={styles.mainContent}>Content</div>
</Layout>
```

## Browser Support

- **Modern browsers**: Full CSS Grid and safe area support
- **iOS Safari**: Dynamic viewport height, safe area insets
- **Android Chrome**: Touch optimization, viewport handling
- **Progressive enhancement**: Graceful fallbacks for older browsers

## Performance Benefits

1. **Reduced JavaScript**: Layout handled by CSS Grid
2. **Better rendering**: Fewer reflows and repaints  
3. **Mobile optimized**: Proper touch handling and viewport management
4. **Accessibility**: Built-in keyboard and screen reader support
5. **Maintainable**: Consistent patterns and utility classes

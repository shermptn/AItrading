import { useState, useEffect } from 'react';

interface BreakpointValues {
  xs: boolean;  // < 640px
  sm: boolean;  // >= 640px
  md: boolean;  // >= 768px
  lg: boolean;  // >= 1024px
  xl: boolean;  // >= 1280px
  '2xl': boolean; // >= 1536px
}

export function useResponsive(): BreakpointValues {
  const [breakpoints, setBreakpoints] = useState<BreakpointValues>({
    xs: true,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
  });

  useEffect(() => {
    const updateBreakpoints = () => {
      const width = window.innerWidth;
      setBreakpoints({
        xs: width < 640,
        sm: width >= 640,
        md: width >= 768,
        lg: width >= 1024,
        xl: width >= 1280,
        '2xl': width >= 1536,
      });
    };

    // Initial check
    updateBreakpoints();

    // Add event listener
    window.addEventListener('resize', updateBreakpoints);

    // Cleanup
    return () => window.removeEventListener('resize', updateBreakpoints);
  }, []);

  return breakpoints;
}

// Hook for checking if screen is mobile-sized
export function useIsMobile(): boolean {
  const { md } = useResponsive();
  return !md;
}

// Hook for getting current screen size category
export function useScreenSize(): 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' {
  const breakpoints = useResponsive();
  
  if (breakpoints['2xl']) return '2xl';
  if (breakpoints.xl) return 'xl';
  if (breakpoints.lg) return 'lg';
  if (breakpoints.md) return 'md';
  if (breakpoints.sm) return 'sm';
  return 'xs';
}
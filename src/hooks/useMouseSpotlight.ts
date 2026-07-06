import { useEffect } from 'react';

/**
 * Performant hook that binds to mouse movements and updates global CSS variables
 * `--mouse-x` and `--mouse-y` on the document root. This enables CSS-only spotlight
 * overlays without triggering React re-renders.
 */
export function useMouseSpotlight() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Set initial position to center of screen
    document.documentElement.style.setProperty('--mouse-x', `${window.innerWidth / 2}px`);
    document.documentElement.style.setProperty('--mouse-y', `${window.innerHeight / 2}px`);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
}
export default useMouseSpotlight;


import { useEffect } from 'react';

interface UseMapResizeProps {
  map: React.MutableRefObject<mapboxgl.Map | null>;
  mounted: boolean;
}

export const useMapResize = ({ map, mounted }: UseMapResizeProps) => {
  // Manuelle Größenanpassung mit reduzierten Ereignissen
  useEffect(() => {
    if (!map.current || !mounted) return;
    
    const handleResize = () => {
      requestAnimationFrame(() => {
        if (map.current) {
          map.current.resize();
        }
      });
    };

    // Weniger häufige Resize-Events durch Debounce
    let resizeTimeout: number;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);
    
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimeout);
    };
  }, [mounted, map]);
};

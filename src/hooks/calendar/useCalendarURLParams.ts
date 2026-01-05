
import { useLocation, useNavigate } from 'react-router-dom';
import { CalendarEvent } from '@/types/calendar';
import { useCallback, useRef, useEffect } from 'react';

export const useCalendarURLParams = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const lastUrlRef = useRef<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const eventIdFromUrl = searchParams.get('eventId');
  
  // CRITICAL FIX: Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  const setEventInUrl = useCallback((event: CalendarEvent | null) => {
    const newParams = new URLSearchParams(location.search);
    
    if (event) {
      newParams.set('eventId', event.id);
    } else {
      newParams.delete('eventId');
    }
    
    const newUrl = newParams.toString();
    
    // CRITICAL FIX: Nur navigieren, wenn sich die URL tatsächlich geändert hat
    if (newUrl !== lastUrlRef.current && newUrl !== location.search.substring(1)) {
      // CRITICAL FIX: Debounce navigation to prevent rapid updates
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        lastUrlRef.current = newUrl;
        navigate({
          pathname: location.pathname,
          search: newUrl
        }, { replace: true });
      }, 50); // 50ms debounce
    }
  }, [location.pathname, location.search, navigate]);
  
  const setDateInUrl = useCallback((date: Date) => {
    const newParams = new URLSearchParams(location.search);
    newParams.set('date', date.toISOString());
    
    const newUrl = newParams.toString();
    
    // CRITICAL FIX: Nur navigieren, wenn sich die URL tatsächlich geändert hat
    if (newUrl !== lastUrlRef.current && newUrl !== location.search.substring(1)) {
      // CRITICAL FIX: Debounce navigation to prevent rapid updates
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      debounceTimerRef.current = setTimeout(() => {
        lastUrlRef.current = newUrl;
        navigate({
          pathname: location.pathname,
          search: newUrl
        }, { replace: true });
      }, 50); // 50ms debounce
    }
  }, [location.pathname, location.search, navigate]);

  return {
    eventIdFromUrl,
    setEventInUrl,
    setDateInUrl
  };
};

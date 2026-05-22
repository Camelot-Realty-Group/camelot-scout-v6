import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'scout_tour_completed';

export function useTour() {
  const [isOpen, setIsOpen] = useState(false);

  const startTour = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  // Keep the tour opt-in. Auto-opening this modal blocks every primary workflow
  // for first-time users, including report generation and integrations.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
  }, []);

  return { isOpen, startTour, closeTour };
}

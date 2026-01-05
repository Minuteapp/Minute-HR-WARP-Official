
import { useTimeStart } from './useTimeStart';
import { useTimePauseResume } from './useTimePauseResume';
import { useTimeStop } from './useTimeStop';
import { TimeEntry } from '@/types/time-tracking.types';

interface UseTimeActionsProps {
  user: any;
  currentActiveEntry: TimeEntry | null;
  setIsTracking: (value: boolean) => void;
  setTrackingStartTime: (value: Date | null) => void;
  setElapsedTime: (value: number) => void;
  setPausedTime: (value: number) => void;
  setPauseStartTime: (value: Date | null) => void;
  setIsPaused: (value: boolean) => void;
  elapsedTime: number;
  pausedTime: number;
  pauseStartTime: Date | null;
  setLastDisplayTime?: (value: number) => void;
  calculateDailyWorkHours?: () => number;
  calculateWeeklyWorkHours?: () => number;
}

export const useTimeActions = (props: UseTimeActionsProps) => {
  const { handleTimeAction } = useTimeStart({
    user: props.user,
    setIsTracking: props.setIsTracking,
    setTrackingStartTime: props.setTrackingStartTime,
    setElapsedTime: props.setElapsedTime,
    setPausedTime: props.setPausedTime,
    setLastDisplayTime: props.setLastDisplayTime
  });

  const { handlePauseResume } = useTimePauseResume({
    user: props.user,
    currentActiveEntry: props.currentActiveEntry,
    elapsedTime: props.elapsedTime,
    pauseStartTime: props.pauseStartTime,
    setPauseStartTime: props.setPauseStartTime,
    setPausedTime: props.setPausedTime,
    setIsPaused: props.setIsPaused,
    pausedTime: props.pausedTime,
    setLastDisplayTime: props.setLastDisplayTime || ((v) => {})
  });

  const { handleStop } = useTimeStop({
    user: props.user,
    currentActiveEntry: props.currentActiveEntry,
    elapsedTime: props.elapsedTime,
    setIsTracking: props.setIsTracking,
    setTrackingStartTime: props.setTrackingStartTime,
    setElapsedTime: props.setElapsedTime,
    setPausedTime: props.setPausedTime,
    setPauseStartTime: props.setPauseStartTime,
    setIsPaused: props.setIsPaused,
    setLastDisplayTime: props.setLastDisplayTime
  });

  return {
    handleTimeAction,
    handlePauseResume,
    handleStop
  };
};

import type { Priority, Status } from './types';
import { STATUSES, PRIORITIES } from './types';

export const DEFAULT_STATUS: Status = 'todo';
export const DEFAULT_PRIORITY: Priority = 'medium';

export const NOW_ISO = () => new Date().toISOString();

// Re-export for convenience
export { STATUSES, PRIORITIES };

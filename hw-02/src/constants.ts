import type { Priority, Status } from './dto/Task';

export const DEFAULT_STATUS: Status = 'todo';
export const DEFAULT_PRIORITY: Priority = 'medium';

export const NOW_ISO = () => new Date().toISOString();

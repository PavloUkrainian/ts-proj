export type Status = 'todo' | 'in_progress' | 'done';
export type Priority = 'low' | 'medium' | 'high';

export type RawTask = {
  id: string | number;
  title: string;
  description?: string;
  createdAt?: string | Date;
  status?: Status;
  priority?: Priority;
  deadline?: string | Date;
};

export type Task = {
  id: string | number;
  title: string;
  createdAt: string;      
  status: Status;        
  priority: Priority;     
  description?: string; 
  deadline?: string;     
};

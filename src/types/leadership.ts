// Leadership Portal: messages, teams, work items

export interface LeadershipMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;
  readBy: string[]; // user IDs who have read
}

export interface LeadershipTeam {
  id: string;
  name: string;
  memberIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type WorkItemStatus = 'todo' | 'in_progress' | 'done';

export interface LeadershipWorkItem {
  id: string;
  title: string;
  description?: string;
  assigneeId?: string;
  teamId?: string;
  status: WorkItemStatus;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

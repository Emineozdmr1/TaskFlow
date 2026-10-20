export interface Project {
  id?: string;
  userId: string;
  title: string;
  category: string;
  icon?: string;
  progress: number;
  taskCount: number;
  coverImage?: string;
  coverTheme?: string;
  coverIcon?: string;
  createdAt?: any;
}

export type CreateProjectInput = Omit<Project, 'id' | 'userId' | 'createdAt'>;

export interface TaskAssignee {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export interface Task {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  priority: "Düşük" | "Orta" | "Yüksek";
  status: "Yapılacak" | "Devam Ediyor" | "Tamamlandı";
  startDate?: string;   // Başlangıç Tarihi
  dueDate: string;      // Bitiş Tarihi
  assignedTo?: string;  // Sorumlu Kişi (Metin / İsim)
  assignee?: TaskAssignee; // Sorumlu Kişi (Gelişmiş Altyapı)
  tagId?: string;       // Seçilen etiketin ID'si
  tagName?: string;     // Seçilen etiketin Adı (Örn: Frontend)
  tagColor?: string;    // Seçilen etiketin Rengi (Örn: bg-blue-500)
  subtaskCount?: number;
  completedSubtaskCount?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface Subtask {
  id?: string;
  taskId: string;
  title: string;
  completed: boolean;
}

export interface TaskFile {
  id?: string;
  taskId: string;
  fileName: string;
  fileUrl: string;
  fileSize: string;
  fileType: string;
  storagePath: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface Comment {
  id?: string;
  taskId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: string;
}

export interface ProjectFile {
  id?: string;
  name: string;
  size: number;
  type: string;
  url: string;
  storagePath: string;
  targetId: string; // Proje veya Görev ID'si
  targetType: "project" | "task";
  createdAt?: any;
}

export interface TagItem {
  id?: string;
  name: string;
  color: string;
  userId: string;
}
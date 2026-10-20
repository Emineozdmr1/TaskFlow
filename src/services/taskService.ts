import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import type { Task, Subtask, Comment } from "@/types/project";
import { updateProject } from "@/services/projectService";

const TASKS_COLLECTION = "tasks";

// --- YARDIMCI: Projenin İlerleme Yüzdesini ve Görev Sayısını Otomatik Senkronize Et ---
export const syncProjectProgress = async (projectId: string) => {
  try {
    const q = query(
      collection(db, TASKS_COLLECTION),
      where("projectId", "==", projectId)
    );
    const snapshot = await getDocs(q);
    const projectTasks = snapshot.docs.map((d) => d.data() as Task);

    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.status === "Tamamlandı").length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    await updateProject(projectId, {
      taskCount: total,
      progress: progressPercent,
    });
  } catch (err) {
    console.error("Proje ilerlemesi senkronize edilemedi:", err);
  }
};

// --- GÖREV İŞLEMLERİ (CRUD) ---

// 1. Yeni Görev Ekle
export const createTask = async (
  taskData: Omit<Task, "id" | "createdAt" | "updatedAt">
) => {
  const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
    ...taskData,
    subtaskCount: taskData.subtaskCount || 0,
    completedSubtaskCount: taskData.completedSubtaskCount || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  if (taskData.projectId) {
    await syncProjectProgress(taskData.projectId);
  }
  return docRef.id;
};

// 2. Görev Güncelle
export const updateTask = async (
  taskId: string, 
  updates: Partial<Task>, 
  projectId?: string
) => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  
  let targetProjectId = updates.projectId || projectId;

  if (!targetProjectId) {
    const taskSnap = await getDoc(taskRef);
    if (taskSnap.exists()) {
      targetProjectId = taskSnap.data().projectId;
    }
  }

  await updateDoc(taskRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  if (targetProjectId) {
    await syncProjectProgress(targetProjectId);
  }
};

// 3. Görev Sil
export const deleteTask = async (taskId: string, projectId?: string) => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  
  let targetProjectId = projectId;
  if (!targetProjectId) {
    const taskSnap = await getDoc(taskRef);
    if (taskSnap.exists()) {
      targetProjectId = taskSnap.data().projectId;
    }
  }

  await deleteDoc(taskRef);

  if (targetProjectId) {
    await syncProjectProgress(targetProjectId);
  }
};

// 4. Tek Bir Projeye Ait Görevleri Canlı Dinle
export const subscribeProjectTasks = (
  projectId: string,
  onUpdate: (tasks: Task[]) => void
) => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where("projectId", "==", projectId)
  );

  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    })) as Task[];

    onUpdate(tasks);
  });
};

// 5. Birden Fazla Projeye Ait Görevleri Canlı Dinle
export const subscribeAllTasks = (
  projectIds: string[],
  onUpdate: (tasks: Task[]) => void
) => {
  if (projectIds.length === 0) {
    onUpdate([]);
    return () => {};
  }

  const q = query(
    collection(db, TASKS_COLLECTION),
    where("projectId", "in", projectIds)
  );

  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    })) as Task[];

    onUpdate(tasks);
  });
};

// --- ALT GÖREV (SUBTASK) İŞLEMLERİ (Sub-collection Mimarisi) ---

// Alt Görevleri Canlı Dinle
export const subscribeSubtasks = (
  taskId: string,
  onUpdate: (subtasks: Subtask[]) => void
) => {
  const subtasksRef = collection(db, TASKS_COLLECTION, taskId, "subtasks");
  const q = query(subtasksRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const subtasks: Subtask[] = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    })) as Subtask[];

    onUpdate(subtasks);
  });
};

// Alt Görev Ekle
export const addSubtask = async (taskId: string, title: string) => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  const taskSnap = await getDoc(taskRef);
  if (!taskSnap.exists()) throw new Error("Görev bulunamadı");

  const taskData = taskSnap.data();
  const subtasksRef = collection(db, TASKS_COLLECTION, taskId, "subtasks");

  await addDoc(subtasksRef, {
    title,
    completed: false,
    createdAt: serverTimestamp(),
  });

  const newSubtaskCount = (taskData.subtaskCount || 0) + 1;
  await updateDoc(taskRef, {
    subtaskCount: newSubtaskCount,
    updatedAt: serverTimestamp(),
  });
};

// Alt Görev Tamamlanma Durumunu Değiştir (Checkbox)
export const toggleSubtask = async (
  taskId: string,
  subtaskId: string,
  completed: boolean
) => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  const subtaskRef = doc(db, TASKS_COLLECTION, taskId, "subtasks", subtaskId);

  await updateDoc(subtaskRef, { completed });

  // Görevin tamamlanan alt görev sayısını güncelle
  const subtasksSnap = await getDocs(collection(db, TASKS_COLLECTION, taskId, "subtasks"));
  const allSubtasks = subtasksSnap.docs.map((d) => d.data());
  const completedCount = allSubtasks.filter((s) => s.completed).length;

  await updateDoc(taskRef, {
    completedSubtaskCount: completedCount,
    updatedAt: serverTimestamp(),
  });
};

// Alt Görev Başlığını Güncelle
export const updateSubtaskTitle = async (
  taskId: string,
  subtaskId: string,
  title: string
) => {
  const subtaskRef = doc(db, TASKS_COLLECTION, taskId, "subtasks", subtaskId);
  await updateDoc(subtaskRef, { title: title.trim() });
};

// Alt Görev Sil
export const deleteSubtask = async (taskId: string, subtaskId: string) => {
  const taskRef = doc(db, TASKS_COLLECTION, taskId);
  const subtaskRef = doc(db, TASKS_COLLECTION, taskId, "subtasks", subtaskId);

  await deleteDoc(subtaskRef);

  // Güncel sayaçları hesapla
  const subtasksSnap = await getDocs(collection(db, TASKS_COLLECTION, taskId, "subtasks"));
  const allSubtasks = subtasksSnap.docs.map((d) => d.data());
  const totalCount = allSubtasks.length;
  const completedCount = allSubtasks.filter((s) => s.completed).length;

  await updateDoc(taskRef, {
    subtaskCount: totalCount,
    completedSubtaskCount: completedCount,
    updatedAt: serverTimestamp(),
  });
};

// --- YORUM İŞLEMLERİ ---

export const subscribeComments = (
  taskId: string,
  onUpdate: (comments: Comment[]) => void
) => {
  const commentsRef = collection(db, TASKS_COLLECTION, taskId, "comments");
  const q = query(commentsRef, orderBy("createdAt", "asc"));

  return onSnapshot(q, (snapshot) => {
    const comments: Comment[] = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    })) as Comment[];

    onUpdate(comments);
  });
};

export const addComment = async (
  taskId: string,
  userName: string,
  text: string,
  userAvatar?: string
) => {
  const commentsRef = collection(db, TASKS_COLLECTION, taskId, "comments");
  await addDoc(commentsRef, {
    taskId,
    userName,
    userAvatar: userAvatar || "",
    text,
    createdAt: new Date().toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });
};

export const deleteComment = async (taskId: string, commentId: string) => {
  const commentRef = doc(db, TASKS_COLLECTION, taskId, "comments", commentId);
  await deleteDoc(commentRef);
};
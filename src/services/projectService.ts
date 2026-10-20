import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import type { Project, CreateProjectInput } from '@/types/project';

const COLLECTION_NAME = 'projects';

// 1. Yeni Proje Ekle
export const createProject = async (
  userId: string, 
  input: CreateProjectInput
): Promise<string> => {
  try {
    // undefined değerleri temizle
    const cleanInput = Object.entries(input).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...cleanInput,
      userId,
      progress: input.progress ?? 0,
      taskCount: input.taskCount ?? 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Proje oluşturulurken hata:', error);
    throw error;
  }
};

// 2. Kullanıcının Projelerini Anlık Dinle (Real-time Subscription)
export const subscribeProjects = (
  userId: string, 
  onUpdate: (projects: Project[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q, 
    (snapshot) => {
      const projects: Project[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      
      onUpdate(projects);
    },
    (error) => {
      console.error('Proje aboneliğinde hata:', error);
      if (onError) onError(error);
    }
  );
};

// 3. Tek Bir Projeyi ID'sine Göre Canlı Dinle (Real-time Subscription)
export const subscribeProjectById = (
  projectId: string,
  onUpdate: (project: Project | null) => void,
  onError?: (error: Error) => void
) => {
  const projectDocRef = doc(db, COLLECTION_NAME, projectId);

  return onSnapshot(
    projectDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate({ id: docSnap.id, ...docSnap.data() } as Project);
      } else {
        onUpdate(null);
      }
    },
    (error) => {
      console.error('Proje çekilirken hata oluştu:', error);
      if (onError) onError(error);
      onUpdate(null);
    }
  );
};

// 4. Tek Seferlik Projeleri Getir (Gerektiğinde Kullanmak İçin)
export const getUserProjects = async (userId: string): Promise<Project[]> => {
  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
  } catch (error) {
    console.error('Projeler çekilirken hata:', error);
    throw error;
  }
};

// 5. Proje Güncelle (undefined değerler filtrelenerek gönderilir)
export const updateProject = async (
  projectId: string, 
  input: Partial<Project>
): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, projectId);

    // Firestore 'undefined' alanları kabul etmediğinden temizliyoruz:
    const cleanData = Object.entries(input).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {} as Record<string, any>);

    await updateDoc(docRef, cleanData);
  } catch (error) {
    console.error('Proje güncellenirken hata:', error);
    throw error;
  }
};

// 6. Proje Sil
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, projectId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Proje silinirken hata:', error);
    throw error;
  }
};
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    where,
    serverTimestamp,
  } from "firebase/firestore";
  import { db } from "@/firebase/config";
  import type { TagItem } from "@/types/project";
  
  const TAGS_COLLECTION = "tags";
  
  export const subscribeTags = (
    userId: string,
    onUpdate: (tags: TagItem[]) => void
  ) => {
    const q = query(
      collection(db, TAGS_COLLECTION),
      where("userId", "==", userId)
    );
  
    return onSnapshot(q, (snapshot) => {
      const tags = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as TagItem[];
      onUpdate(tags);
    });
  };
  
  export const createTag = async (userId: string, name: string, color: string) => {
    await addDoc(collection(db, TAGS_COLLECTION), {
      userId,
      name,
      color,
      createdAt: serverTimestamp(),
    });
  };
  
  export const deleteTag = async (tagId: string) => {
    await deleteDoc(doc(db, TAGS_COLLECTION, tagId));
  };
import { deleteUser } from "firebase/auth";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

// Kullanıcının Tüm Verilerini ve Hesabını Kalıcı Olarak Sil
export const deleteUserAccountAndData = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("Oturum açmış kullanıcı bulunamadı.");

  const userId = user.uid;

  // 1. Kullanıcıya ait tüm projeleri sil
  const projectsQuery = query(collection(db, "projects"), where("userId", "==", userId));
  const projectsSnap = await getDocs(projectsQuery);

  for (const projectDoc of projectsSnap.docs) {
    // Projeye ait tüm görevleri sil
    const tasksQuery = query(collection(db, "tasks"), where("projectId", "==", projectDoc.id));
    const tasksSnap = await getDocs(tasksQuery);
    for (const taskDoc of tasksSnap.docs) {
      await deleteDoc(doc(db, "tasks", taskDoc.id));
    }
    // Proje dokümanını sil
    await deleteDoc(doc(db, "projects", projectDoc.id));
  }

  // 2. Kullanıcıya ait tüm etiketleri sil
  const tagsQuery = query(collection(db, "tags"), where("userId", "==", userId));
  const tagsSnap = await getDocs(tagsQuery);
  for (const tagDoc of tagsSnap.docs) {
    await deleteDoc(doc(db, "tags", tagDoc.id));
  }

  // 3. Firebase Auth hesabını sil
  await deleteUser(user);
};
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import type { ProjectFile, TaskFile } from "@/types/project";

const FILES_COLLECTION = "files";

// Cloudinary Yapılandırma Bilgileri
const CLOUD_NAME = "b161if3j";
const UPLOAD_PRESET = "taskflow_preset";

// Kabul edilen dosya türleri (Senior Güvenlik Doğrulaması)
const ALLOWED_MIME_PREFIXES = [
  "image/",
  "video/",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

export const isAllowedTaskFile = (file: File): boolean => {
  return ALLOWED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix));
};

// Dosya boyutunu okunabilir formata dönüştürür (Örn: 2.4 MB)
export const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// 1. Cloudinary'ye Dosya Yükle ve Firestore'a Kaydet
export const uploadFile = (
  file: File,
  targetId: string, // projectId veya taskId
  targetType: "project" | "task",
  uploadedBy?: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Güvenlik: Desteklenmeyen dosya türlerini engelle
    if (!isAllowedTaskFile(file)) {
      return reject(
        new Error(
          "Desteklenmeyen dosya türü. Yalnızca Resim, Video, PDF, Word veya Excel dosyaları yükleyebilirsiniz."
        )
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    // PDF ve dökümanlar için 'raw', görsel ve videolar için 'auto'
    const isDocument =
      file.type.includes("pdf") ||
      file.type.includes("word") ||
      file.type.includes("sheet") ||
      file.type.includes("ms-excel") ||
      file.type.includes("officedocument");
    const resourceType = isDocument ? "raw" : "auto";

    const xhr = new XMLHttpRequest();
    xhr.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`
    );

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }

    xhr.onload = async () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          const downloadURL = response.secure_url;

          // Firestore 'files' koleksiyonuna metaveriyi kaydet
          await addDoc(collection(db, FILES_COLLECTION), {
            name: file.name,
            fileName: file.name,
            size: file.size,
            fileSize: formatFileSize(file.size),
            type: file.type,
            fileType: file.type,
            url: downloadURL,
            fileUrl: downloadURL,
            storagePath: response.public_id,
            targetId,
            taskId: targetId,
            targetType,
            uploadedBy: uploadedBy || "Kullanıcı",
            uploadedAt: new Date().toLocaleDateString("tr-TR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            createdAt: serverTimestamp(),
          });

          resolve(downloadURL);
        } catch (err) {
          console.error("Firestore kayıt hatası:", err);
          reject(err);
        }
      } else {
        console.error("Cloudinary yükleme hatası:", xhr.responseText);
        reject(new Error("Dosya yükleme işlemi başarısız oldu."));
      }
    };

    xhr.onerror = () => {
      console.error("Ağ bağlantısı hatası");
      reject(new Error("Ağ hatası nedeniyle dosya yüklenemedi."));
    };

    xhr.send(formData);
  });
};

// 2. Belirli Bir Projeye/Göreve Ait Dosyaları Canlı Dinle
export const subscribeFiles = (
  targetId: string,
  onUpdate: (files: ProjectFile[]) => void
) => {
  const q = query(
    collection(db, FILES_COLLECTION),
    where("targetId", "==", targetId)
  );

  return onSnapshot(q, (snapshot) => {
    const files: ProjectFile[] = snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    })) as ProjectFile[];

    onUpdate(files);
  });
};

// 3. Dosyayı Sil (Firestore Kaydını Temizler)
export const deleteFile = async (
  fileId: string,
  _storagePath?: string
): Promise<void> => {
  await deleteDoc(doc(db, FILES_COLLECTION, fileId));
};

// --- TASK MODALI İLE UYUMLULUK KÖPRÜLERİ (ALIAS) ---

// TaskDetailModal için doğrudan görev dosyalarını canlı dinleyici
export const subscribeTaskFiles = (
  taskId: string,
  onUpdate: (files: TaskFile[]) => void
) => {
  const q = query(
    collection(db, FILES_COLLECTION),
    where("targetId", "==", taskId)
  );

  return onSnapshot(q, (snapshot) => {
    const files = snapshot.docs.map((docItem) => {
      const data = docItem.data();
      return {
        id: docItem.id,
        taskId: data.targetId || taskId,
        fileName: data.fileName || data.name,
        fileUrl: data.fileUrl || data.url,
        fileSize: data.fileSize || formatFileSize(data.size),
        fileType: data.fileType || data.type || "",
        storagePath: data.storagePath,
        uploadedAt: data.uploadedAt || "",
        uploadedBy: data.uploadedBy || "Kullanıcı",
      } as TaskFile;
    });

    onUpdate(files);
  });
};

// TaskDetailModal için doğrudan görev dosyası yükleme fonksiyonu
export const uploadTaskFile = (
  taskId: string,
  file: File,
  uploadedBy: string,
  onProgress?: (progress: number) => void
): Promise<string> => {
  return uploadFile(file, taskId, "task", uploadedBy, onProgress);
};

// TaskDetailModal için doğrudan görev dosyası silme fonksiyonu
export const deleteTaskFile = (
  _taskId: string,
  fileId: string,
  storagePath: string
): Promise<void> => {
  return deleteFile(fileId, storagePath);
};
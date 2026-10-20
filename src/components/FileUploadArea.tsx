import React, { useState } from "react";
import { UploadCloud, File, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { uploadFile, deleteFile, subscribeFiles } from "@/services/storageService";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import type { ProjectFile } from "@/types/project";

interface FileUploadAreaProps {
  targetId: string;
  targetType: "project" | "task";
}

export default function FileUploadArea({ targetId, targetType }: FileUploadAreaProps) {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  React.useEffect(() => {
    if (!targetId) return;

    const unsubscribe = subscribeFiles(targetId, (data) => {
      setFiles(data);
    });

    return () => unsubscribe();
  }, [targetId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const uploaderName =
      currentUser?.displayName || currentUser?.email?.split("@")[0] || "Kullanıcı";

    try {
      setUploading(true);
      setProgress(0);

      await uploadFile(
        selectedFile,
        targetId,
        targetType,
        uploaderName,
        (prog: number) => {
          setProgress(prog);
        }
      );

      toast.success("Dosya Yüklendi", {
        description: `"${selectedFile.name}" başarıyla eklendi.`,
      });
    } catch (error: any) {
      console.error("Dosya yüklenemedi:", error);
      toast.error("Dosya Yüklenemedi", {
        description: error?.message || "Lütfen dosya türünü ve boyutunu kontrol edin.",
      });
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = "";
    }
  };

  const handleDelete = async (fileId: string, fileName: string, storagePath: string) => {
    toast("Dosyayı silmek istediğinize emin misiniz?", {
      description: `"${fileName}" kalıcı olarak kaldırılacak.`,
      action: {
        label: "Sil",
        onClick: async () => {
          try {
            await deleteFile(fileId, storagePath);
            toast.success("Dosya Silindi", {
              description: `"${fileName}" başarıyla kaldırıldı.`,
            });
          } catch (error: any) {
            console.error("Dosya silinemedi:", error);
            toast.error("Dosya Silinemedi", {
              description: error?.message || "İşlem sırasında bir hata oluştu.",
            });
          }
        },
      },
      cancel: {
        label: "Vazgeç",
        onClick: () => {},
      },
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Byte";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <label className="border-2 border-dashed border-border hover:border-primary rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-secondary/20 hover:bg-secondary/40 transition group">
        <input
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
        {uploading ? (
          <div className="flex flex-col items-center space-y-2 py-2">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
            <span className="text-xs text-muted-foreground font-semibold">
              {t("uploadingText")} %{progress}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-1 py-2 text-center">
            <UploadCloud className="w-7 h-7 text-muted-foreground group-hover:text-primary transition" />
            <span className="text-xs font-semibold text-foreground">
              {t("fileUploadDrop")}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {t("fileUploadLimit")}
            </span>
          </div>
        )}
      </label>

      {/* File List */}
      <div className="space-y-2">
        {files.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-2">
            {t("noFilesAttached")}
          </p>
        ) : (
          files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2.5 bg-secondary/30 rounded-xl border border-border text-xs hover:border-muted-foreground/30 transition"
            >
              <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                <File className="w-4 h-4 text-primary shrink-0" />
                <div className="truncate">
                  <p className="font-semibold text-foreground truncate">
                    {file.name}
                  </p>
                  <span className="text-[10px] text-muted-foreground">
                    {formatFileSize(file.size || 0)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-muted-foreground hover:text-primary transition rounded-lg hover:bg-secondary"
                  title="Görüntüle / İndir"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleDelete(file.id!, file.name || "Dosya", file.storagePath)}
                  className="p-1.5 text-muted-foreground hover:text-rose-500 transition rounded-lg hover:bg-secondary cursor-pointer"
                  title="Dosyayı Sil"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
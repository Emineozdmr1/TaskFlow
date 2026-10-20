import React, { useState, useEffect } from "react";
import {
  X,
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Flag,
  Loader2,
  MessageSquare,
  Send,
  User as UserIcon,
  AlignLeft,
  Paperclip,
  FileText,
  Download,
  File,
  Image as ImageIcon,
  Video,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  subscribeSubtasks,
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  updateTask,
  subscribeComments,
  addComment,
  deleteComment,
} from "@/services/taskService";
import {
  subscribeTaskFiles,
  uploadTaskFile,
  deleteTaskFile,
} from "@/services/storageService";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import type { Task, Subtask, Comment, TaskFile } from "@/types/project";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function TaskDetailModal({
  task,
  isOpen,
  onClose,
}: TaskDetailModalProps) {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [addingSubtask, setAddingSubtask] = useState(false);

  // Yorum State'leri
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [addingComment, setAddingComment] = useState(false);

  // Dosya Yükleme State'leri
  const [files, setFiles] = useState<TaskFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Subtask, Comment & File Dinleyicileri
  useEffect(() => {
    if (!task?.id || !isOpen) return;

    const unsubSubtasks = subscribeSubtasks(task.id, (data) => {
      setSubtasks(data);
      const completedCount = data.filter((s) => s.completed).length;
      if (
        task.subtaskCount !== data.length ||
        task.completedSubtaskCount !== completedCount
      ) {
        updateTask(task.id!, {
          subtaskCount: data.length,
          completedSubtaskCount: completedCount,
        });
      }
    });

    const unsubComments = subscribeComments(task.id, (data) => {
      setComments(data);
    });

    const unsubFiles = subscribeTaskFiles(task.id, (data) => {
      setFiles(data);
    });

    return () => {
      unsubSubtasks();
      unsubComments();
      unsubFiles();
    };
  }, [task?.id, isOpen]);

  if (!isOpen || !task) return null;

  // Gecikmiş / Tamamlanmış Görev Durumu Kontrolü
  const todayStr = new Date().toISOString().split("T")[0];
  const isCompleted = task.status === "Tamamlandı";
  const isOverdue = task.dueDate < todayStr && !isCompleted;
  const assignedPerson = task.assignee?.displayName || task.assignedTo || "Atanmadı";

  // Dosya Yükleme İşlemi
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !task.id) return;

    const uploaderName =
      currentUser?.displayName || currentUser?.email?.split("@")[0] || "Kullanıcı";

    try {
      setUploading(true);
      await uploadTaskFile(
        task.id,
        selectedFile,
        uploaderName,
        (progress) => {
          setUploadProgress(progress);
        }
      );

      toast.success("Dosya Yüklendi", {
        description: `"${selectedFile.name}" göreve eklendi.`,
      });
    } catch (error: any) {
      console.error("Dosya yüklenirken hata oluştu:", error);
      toast.error("Dosya Yüklenemedi", {
        description: error?.message || "Lütfen dosya türünü kontrol edin.",
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = "";
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string, storagePath: string) => {
    if (!task.id) return;

    toast("Dosyayı silmek istediğinize emin misiniz?", {
      description: `"${fileName}" kalıcı olarak silinecek.`,
      action: {
        label: "Sil",
        onClick: async () => {
          try {
            await deleteTaskFile(task.id!, fileId, storagePath);
            toast.success("Dosya Silindi");
          } catch (error: any) {
            console.error("Dosya silinemedi:", error);
            toast.error("Dosya silinirken bir hata oluştu.");
          }
        },
      },
      cancel: {
        label: "Vazgeç",
        onClick: () => {},
      },
    });
  };

  // Alt Görev İşlemleri
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !task.id) return;

    try {
      setAddingSubtask(true);
      await addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle("");
      toast.success("Alt Görev Eklendi");
    } catch (error: any) {
      console.error("Alt görev eklenemedi:", error);
      toast.error("Alt görev eklenemedi.");
    } finally {
      setAddingSubtask(false);
    }
  };

  const handleToggleSubtask = async (subtaskId: string, completed: boolean) => {
    if (!task.id) return;
    try {
      await toggleSubtask(task.id, subtaskId, !completed);
    } catch (error: any) {
      console.error("Alt görev durumu güncellenemedi:", error);
      toast.error("Durum güncellenemedi.");
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!task.id) return;
    try {
      await deleteSubtask(task.id, subtaskId);
      toast.info("Alt görev silindi.");
    } catch (error: any) {
      console.error("Alt görev silinemedi:", error);
      toast.error("Alt görev silinemedi.");
    }
  };

  // Yorum İşlemleri
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !task.id) return;

    const userName =
      currentUser?.displayName || currentUser?.email?.split("@")[0] || "Kullanıcı";

    try {
      setAddingComment(true);
      await addComment(task.id, userName, commentText.trim());
      setCommentText("");
      toast.success("Yorum Eklendi");
    } catch (error: any) {
      console.error("Yorum eklenemedi:", error);
      toast.error("Yorum gönderilemedi.");
    } finally {
      setAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!task.id) return;
    try {
      await deleteComment(task.id, commentId);
      toast.info("Yorum kaldırıldı.");
    } catch (error: any) {
      console.error("Yorum silinemedi:", error);
      toast.error("Yorum silinemedi.");
    }
  };

  const progressPercent =
    subtasks.length > 0
      ? Math.round(
          (subtasks.filter((s) => s.completed).length / subtasks.length) * 100
        )
      : 0;

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <ImageIcon className="w-4 h-4 text-blue-500" />;
    if (fileType.startsWith("video/")) return <Video className="w-4 h-4 text-purple-500" />;
    if (fileType.includes("pdf")) return <FileText className="w-4 h-4 text-rose-500" />;
    return <File className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Durum Bandı (Gecikmiş / Tamamlanmış Uyarı) */}
        {isOverdue && (
          <div className="bg-rose-500/10 border-b border-rose-500/20 px-5 py-2.5 flex items-center justify-between text-xs font-semibold text-rose-500">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{t("taskOverdueAlert") || "Bu görevin süresi geçti!"}</span>
            </span>
            <span>{t("dueDate") || "Bitiş Tarihi"}: {task.dueDate}</span>
          </div>
        )}

        {isCompleted && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-5 py-2.5 flex items-center justify-between text-xs font-semibold text-emerald-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{t("taskCompletedAlert") || "Görev başarıyla tamamlandı!"}</span>
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-border">
          <div className="space-y-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                {t("taskDetailTitle") || "Görev Detayı"}
              </span>
              {task.tagName && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                    task.tagColor || "bg-primary"
                  }`}
                >
                  #{task.tagName}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-foreground leading-snug">
              {task.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Grid (Öncelik, Durum, Başlangıç, Bitiş, Sorumlu) */}
          <div className="grid grid-cols-2 gap-3 bg-secondary/40 p-4 rounded-xl border border-border">
            {/* Öncelik */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Flag className="w-4 h-4 text-primary shrink-0" />
              <span>{t("priorityLabel") || "Öncelik"}:</span>
              <span className="font-semibold text-foreground">
                {t(task.priority === "Yüksek" ? "high" : task.priority === "Orta" ? "medium" : "low")}
              </span>
            </div>

            {/* Sorumlu Kişi */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground truncate">
              <UserIcon className="w-4 h-4 text-primary shrink-0" />
              <span>Sorumlu:</span>
              <span className="font-semibold text-foreground truncate" title={assignedPerson}>
                {assignedPerson}
              </span>
            </div>

            {/* Başlangıç Tarihi */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4 text-primary shrink-0" />
              <span>Başlangıç:</span>
              <span className="font-semibold text-foreground">
                {task.startDate || "-"}
              </span>
            </div>

            {/* Bitiş Tarihi */}
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{t("dueDate") || "Bitiş"}:</span>
              <span
                className={`font-semibold ${
                  isOverdue
                    ? "text-rose-500 font-bold"
                    : isCompleted
                    ? "text-emerald-500"
                    : "text-foreground"
                }`}
              >
                {task.dueDate}
              </span>
            </div>
          </div>

          {/* Görev Açıklaması */}
          {task.description && (
            <div className="space-y-1.5 bg-secondary/30 p-3.5 rounded-xl border border-border">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <AlignLeft className="w-3.5 h-3.5" />
                <span>{t("descriptionLabel") || "Açıklama"}</span>
              </div>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-line pl-5">
                {task.description}
              </p>
            </div>
          )}

          {/* Dosya Yükleme Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-primary" /> {t("attachedFiles") || "Ekli Dosyalar"} ({files.length})
              </h3>

              <label className="px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold rounded-xl cursor-pointer transition flex items-center gap-1.5">
                {uploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                <span>{uploading ? `${t("uploadingText") || "Yükleniyor"} %${uploadProgress}` : t("uploadFileBtn") || "Dosya Ekle"}</span>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Dosya Listesi */}
            <div className="space-y-2">
              {files.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  {t("noFilesAttached") || "Henüz dosya eklenmemiş."}
                </p>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 border border-border hover:border-muted-foreground/30 transition"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden pr-2">
                      {getFileIcon(file.fileType)}
                      <div className="truncate">
                        <p className="text-xs font-semibold text-foreground truncate">
                          {file.fileName}
                        </p>
                        <span className="text-[10px] text-muted-foreground">
                          {file.fileSize} • {file.uploadedAt}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-muted-foreground hover:text-primary transition rounded-lg hover:bg-secondary"
                        title="İndir / Görüntüle"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteFile(file.id!, file.fileName, file.storagePath)}
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

          <hr className="border-border" />

          {/* Subtasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-primary" /> {t("subtasksTitle") || "Alt Görevler"}
              </h3>
              <span className="text-xs font-medium text-muted-foreground">
                %{progressPercent} {t("completed") || "Tamamlandı"}
              </span>
            </div>

            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                placeholder={t("addSubtaskPlaceholder") || "Yeni alt görev yazın..."}
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={addingSubtask || !newSubtaskTitle.trim()}
                className="px-3.5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-xl transition flex items-center justify-center cursor-pointer"
              >
                {addingSubtask ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
              </button>
            </form>

            <div className="space-y-2 pt-1">
              {subtasks.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  {t("noSubtasksYet") || "Henüz alt görev yok."}
                </p>
              ) : (
                subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="group flex items-center justify-between p-2.5 rounded-xl bg-secondary/30 border border-border hover:border-muted-foreground/30 transition"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() =>
                          handleToggleSubtask(subtask.id!, subtask.completed)
                        }
                        className="w-4 h-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
                      />
                      <span
                        className={`text-xs ${
                          subtask.completed
                            ? "line-through text-muted-foreground"
                            : "text-foreground font-medium"
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(subtask.id!)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <hr className="border-border" />

          {/* Comments Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" /> {t("commentsTitle") || "Yorumlar"} ({comments.length})
            </h3>

            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder={t("writeCommentPlaceholder") || "Yorumunuzu yazın..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={addingComment || !commentText.trim()}
                className="px-3.5 py-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-xl transition flex items-center justify-center cursor-pointer"
              >
                {addingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </form>

            <div className="space-y-3 pt-1">
              {comments.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-2">
                  {t("noCommentsYet") || "Henüz yorum yapılmamış."}
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="group p-3 rounded-xl bg-secondary/30 border border-border space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-semibold text-foreground">
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] text-primary">
                          <UserIcon className="w-3 h-3" />
                        </div>
                        <span>{comment.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">
                          {comment.createdAt}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment.id!)}
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground pl-7 leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
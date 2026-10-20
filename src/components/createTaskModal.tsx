import React, { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, CheckSquare, Loader2, AlertCircle, Calendar, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { createTask } from "@/services/taskService";
import { subscribeTags } from "@/services/tagService";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import type { Project, TagItem } from "@/types/project";
import { taskSchema, type TaskFormValues } from "@/validations/taskSchema";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  defaultProjectId?: string;
}

export default function CreateTaskModal({
  isOpen,
  onClose,
  projects,
  defaultProjectId,
}: CreateTaskModalProps) {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(false);

  const initialProjectId = defaultProjectId || projects[0]?.id || "";
  const todayStr = new Date().toISOString().split("T")[0];
  const defaultAssignee =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "";

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: initialProjectId,
      priority: "Orta",
      status: "Yapılacak",
      startDate: todayStr,
      dueDate: todayStr,
      tagId: "",
      assignedTo: defaultAssignee,
    },
  });

  // Kullanıcının etiketlerini canlı dinle
  useEffect(() => {
    if (!currentUser?.uid || !isOpen) return;
    const unsub = subscribeTags(currentUser.uid, (fetchedTags) => {
      setTags(fetchedTags);
    });
    return () => unsub();
  }, [currentUser, isOpen]);

  // Varsayılan proje ID'si veya sorumlu değiştiğinde senkronize et
  useEffect(() => {
    if (defaultProjectId) {
      setValue("projectId", defaultProjectId);
    } else if (projects.length > 0) {
      setValue("projectId", projects[0]?.id || "");
    }
    if (defaultAssignee) {
      setValue("assignedTo", defaultAssignee);
    }
  }, [defaultProjectId, projects, defaultAssignee, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit: SubmitHandler<TaskFormValues> = async (data) => {
    const chosenTag = tags.find((tItem) => tItem.id === data.tagId);

    try {
      setLoading(true);
      await createTask({
        projectId: data.projectId,
        title: data.title.trim(),
        description: data.description ? data.description.trim() : "",
        priority: data.priority,
        status: data.status,
        startDate: data.startDate || todayStr,
        dueDate: data.dueDate,
        assignedTo: data.assignedTo?.trim() || defaultAssignee,
        assignee: currentUser
          ? {
              uid: currentUser.uid,
              displayName: data.assignedTo?.trim() || defaultAssignee,
              email: currentUser.email || "",
              photoURL: currentUser.photoURL || "",
            }
          : undefined,
        tagId: chosenTag?.id || "",
        tagName: chosenTag?.name || "",
        tagColor: chosenTag?.color || "",
        subtaskCount: 0,
        completedSubtaskCount: 0,
      });

      toast.success("Görev Başarıyla Oluşturuldu", {
        description: `"${data.title.trim()}" görevi listeye eklendi.`,
      });

      handleClose();
    } catch (error: any) {
      console.error("Görev oluşturulurken hata:", error);
      toast.error("Görev Oluşturulamadı", {
        description: error?.message || "Beklenmeyen bir hata meydana geldi.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Başlık */}
        <div className="flex items-center justify-between p-5 border-b border-border shrink-0">
          <div className="flex items-center space-x-2 text-primary font-bold">
            <CheckSquare className="w-5 h-5" />
            <span>{t("createTaskTitle") || "Yeni Görev Oluştur"}</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Gövdesi */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Görev Başlığı */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              {t("taskTitleLabel") || "Görev Başlığı"}
            </label>
            <input
              type="text"
              placeholder="Örn: Firestore Kurulumu Yap"
              {...register("title")}
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground text-sm focus:outline-none focus:ring-2 transition ${
                errors.title
                  ? "border-rose-500 focus:ring-rose-500/20 focus:border-rose-500"
                  : "border-border focus:ring-primary/20 focus:border-primary"
              }`}
            />
            {errors.title && (
              <span className="flex items-center gap-1 text-[11px] text-rose-500 mt-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {errors.title.message}
              </span>
            )}
          </div>

          {/* Proje ve Sorumlu Kişi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {!defaultProjectId ? (
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                  {t("belongsToProject") || "Ait Olduğu Proje"}
                </label>
                <select
                  {...register("projectId")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className={defaultProjectId ? "sm:col-span-2" : ""}>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                Sorumlu Kişi
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Örn: Ahmet Yılmaz"
                  {...register("assignedTo")}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>
          </div>

          {/* Öncelik ve Etiket */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                {t("priorityLabel") || "Öncelik"}
              </label>
              <select
                {...register("priority")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
              >
                <option value="Düşük">{t("low") || "Düşük"}</option>
                <option value="Orta">{t("medium") || "Orta"}</option>
                <option value="Yüksek">{t("high") || "Yüksek"}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                {t("tagOptional") || "Etiket"}
              </label>
              <select
                {...register("tagId")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
              >
                <option value="">{t("noTagSelected") || "Etiket Seçilmedi"}</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    #{tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Başlangıç ve Bitiş Tarihleri */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Başlangıç Tarihi
              </label>
              <input
                type="date"
                {...register("startDate")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-500" />
                {t("dueDate") || "Bitiş Tarihi"}
              </label>
              <input
                type="date"
                {...register("dueDate")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              />
            </div>
          </div>

          {/* Açıklama */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              {t("descriptionLabel") || "Açıklama"}
            </label>
            <textarea
              rows={3}
              placeholder={t("writeTaskDetails") || "Görev ile ilgili detayları yazın..."}
              {...register("description")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
            />
          </div>

          {/* Aksiyon Butonları */}
          <div className="pt-2 flex items-center justify-end space-x-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary rounded-xl transition cursor-pointer"
            >
              {t("cancel") || "Vazgeç"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-xl transition shadow-md shadow-primary/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("adding") || "Ekleniyor..."}</span>
                </>
              ) : (
                <span>{t("newTaskBtn") || "Görev Oluştur"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
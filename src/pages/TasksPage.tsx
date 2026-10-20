import React, { useEffect, useState } from "react";
import {
  CheckSquare,
  Plus,
  Trash2,
  Clock,
  AlertCircle,
  Filter,
  CheckCircle2,
  Circle,
  PlayCircle,
  Tag as TagIcon,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { subscribeProjects } from "@/services/projectService";
import { subscribeAllTasks, updateTask, deleteTask } from "@/services/taskService";
import { subscribeTags } from "@/services/tagService";
import type { Task, Project, TagItem } from "@/types/project";
import CreateTaskModal from "@/components/createTaskModal";
import TaskDetailModal from "@/components/TaskDetailModal";
import PageTransition from "@/components/animations/PageTransition";
import { TaskRowSkeleton } from "@/components/skeletons/TaskRowSkeleton";

export default function TasksPage() {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("Tümü");
  const [priorityFilter, setPriorityFilter] = useState<string>("Tümü");
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>("Tümü");

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribeProjects = subscribeProjects(currentUser.uid, (projList) => {
      setProjects(projList);
    });

    const unsubscribeTags = subscribeTags(currentUser.uid, (tagList) => {
      setTags(tagList);
    });

    return () => {
      unsubscribeProjects();
      unsubscribeTags();
    };
  }, [currentUser]);

  useEffect(() => {
    const projectIds = projects
      .map((p) => p.id)
      .filter((id): id is string => Boolean(id));

    if (projectIds.length === 0) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const safeProjectIds = projectIds.slice(0, 30);
    const unsubscribeTasks = subscribeAllTasks(safeProjectIds, (taskList) => {
      setTasks(taskList);
      setLoading(false);
    });

    return () => unsubscribeTasks();
  }, [projects]);

  const handleOpenDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const handleStatusChange = async (
    e: React.MouseEvent,
    taskId?: string,
    newStatus?: "Yapılacak" | "Devam Ediyor" | "Tamamlandı"
  ) => {
    e.stopPropagation();
    if (!taskId || !newStatus) return;
    try {
      await updateTask(taskId, { status: newStatus });
      toast.success("Görev Durumu Güncellendi", {
        description: `Durum "${newStatus}" olarak ayarlandı.`,
      });
    } catch (error: any) {
      console.error("Görev durumu güncellenirken hata:", error);
      toast.error("Durum Güncellenemedi", {
        description: error?.message || "Bir sorun oluştu.",
      });
    }
  };

  const handleDeleteTask = (e: React.MouseEvent, taskId?: string, taskTitle?: string) => {
    e.stopPropagation();
    if (!taskId) return;

    toast("Görevi silmek istediğinize emin misiniz?", {
      description: `"${taskTitle || "Görev"}" kalıcı olarak silinecek.`,
      action: {
        label: "Sil",
        onClick: async () => {
          try {
            await deleteTask(taskId);
            toast.success("Görev Silindi", {
              description: `"${taskTitle || "Görev"}" kaldırıldı.`,
            });
          } catch (error: any) {
            console.error("Görev silinirken hata:", error);
            toast.error("Görev Silinemedi", {
              description: error?.message || "Bir sorun oluştu.",
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

  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLocaleLowerCase("tr").trim();

    const titleMatch = task.title
      ? task.title.toLocaleLowerCase("tr").includes(query)
      : false;
    const descMatch = task.description
      ? task.description.toLocaleLowerCase("tr").includes(query)
      : false;
    const tagMatch = task.tagName
      ? task.tagName.toLocaleLowerCase("tr").includes(query)
      : false;

    const matchesQuery = !query || titleMatch || descMatch || tagMatch;
    const matchesStatus =
      statusFilter === "Tümü" || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === "Tümü" || task.priority === priorityFilter;
    const matchesTag =
      selectedTagFilter === "Tümü" || task.tagId === selectedTagFilter;

    return matchesQuery && matchesStatus && matchesPriority && matchesTag;
  });

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "Yüksek":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "Orta":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      default:
        return "bg-secondary text-muted-foreground border-border";
    }
  };

  return (
    <PageTransition className="space-y-5 max-w-7xl mx-auto p-3 sm:p-6">
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projects={projects}
      />

      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
      />

      {/* Başlık ve Buton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-primary shrink-0" /> {t("tasksPageTitle")}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t("tasksPageSub")}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreateModalOpen(true)}
          disabled={projects.length === 0}
          className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground text-sm font-semibold rounded-xl transition shadow-md shadow-primary/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t("newTaskBtn")}</span>
        </motion.button>
      </div>

      {/* Arama & Filtreleme Kartı */}
      <div className="bg-card p-3 sm:p-4 rounded-2xl border border-border shadow-sm space-y-3">
        {/* Arama Çubuğu */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
          />
        </div>

        {/* Mobilde Yatay Kayan Filtre Barı */}
        <div className="flex flex-col gap-2.5 pt-2 border-t border-border/60">
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
            {/* Durum Filtreleri */}
            <div className="flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0 mr-1" />
              {[
                { label: t("allText"), value: "Tümü" },
                { label: t("todo"), value: "Yapılacak" },
                { label: t("inProgress"), value: "Devam Ediyor" },
                { label: t("completed"), value: "Tamamlandı" },
              ].map((status) => (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setStatusFilter(status.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 cursor-pointer ${
                    statusFilter === status.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>

            {/* Öncelik Seçici */}
            <div className="shrink-0 pl-2 border-l border-border flex items-center gap-1.5">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-background border border-border text-xs font-semibold rounded-lg px-2 py-1 text-foreground focus:outline-none cursor-pointer"
              >
                <option value="Tümü">{t("allPriorities")}</option>
                <option value="Yüksek">{t("high")}</option>
                <option value="Orta">{t("medium")}</option>
                <option value="Düşük">{t("low")}</option>
              </select>
            </div>

            {/* Etiketler */}
            {tags.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0 pl-2 border-l border-border">
                <TagIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <button
                  type="button"
                  onClick={() => setSelectedTagFilter("Tümü")}
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                    selectedTagFilter === "Tümü"
                      ? "bg-secondary text-foreground font-bold"
                      : "text-muted-foreground hover:bg-secondary/60"
                  }`}
                >
                  {t("allText")}
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => setSelectedTagFilter(tag.id!)}
                    className={`px-2 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      selectedTagFilter === tag.id
                        ? "ring-2 ring-primary bg-secondary text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${tag.color}`} />
                    <span>{tag.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {t("foundText")} <b className="text-foreground">{filteredTasks.length}</b> {t("tasksCountText")}
            </span>
          </div>
        </div>
      </div>

      {/* Görev Listesi */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((idx) => (
            <TaskRowSkeleton key={idx} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-border shadow-sm">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">
            {t("noProjectWarningTitle")}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {t("noProjectWarningSub")}
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-2xl border border-border shadow-sm">
          <CheckSquare className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">{t("noTasksFound")}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);

            return (
              <div
                key={task.id}
                onClick={() => handleOpenDetail(task)}
                className="group p-3.5 sm:p-4 bg-card rounded-2xl border border-border hover:border-primary/50 transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={(e) =>
                      handleStatusChange(
                        e,
                        task.id,
                        task.status === "Tamamlandı"
                          ? "Yapılacak"
                          : task.status === "Yapılacak"
                          ? "Devam Ediyor"
                          : "Tamamlandı"
                      )
                    }
                    className="mt-0.5 text-muted-foreground hover:text-primary transition cursor-pointer shrink-0"
                  >
                    {task.status === "Tamamlandı" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : task.status === "Devam Ediyor" ? (
                      <PlayCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3
                        className={`font-semibold text-sm text-foreground truncate ${
                          task.status === "Tamamlandı"
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.tagName && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white shrink-0 ${
                            task.tagColor || "bg-primary"
                          }`}
                        >
                          #{task.tagName}
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
                        {project?.title || "Proje"}
                      </span>
                      <span className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" /> {task.dueDate}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Alt Kısım / Sağ Kısım: Öncelik ve Sil Butonu */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                  <span
                    className={`px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-lg border ${getPriorityBadge(
                      task.priority
                    )}`}
                  >
                    {t(task.priority === "Yüksek" ? "high" : task.priority === "Orta" ? "medium" : "low")}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteTask(e, task.id, task.title)}
                    className="p-1.5 text-muted-foreground hover:text-rose-500 transition rounded-lg hover:bg-secondary cursor-pointer"
                    title="Görevi Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageTransition>
  );
}
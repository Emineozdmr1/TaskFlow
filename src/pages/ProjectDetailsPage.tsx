import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  subscribeProjectTasks,
  createTask,
  updateTask,
  deleteTask,
} from "@/services/taskService";
import { subscribeProjectById } from "@/services/projectService";
import { subscribeTags } from "@/services/tagService";
import { useAuth } from "@/contexts/AuthContext";
import type { Task, Project, TagItem } from "@/types/project";
import TaskDetailModal from "@/components/TaskDetailModal";
import { useSettings } from "@/contexts/SettingsContext";
import PageTransition from "@/components/animations/PageTransition";
import { ProjectDetailsSkeleton } from "@/components/skeletons/ProjectDetailsSkeleton";
import {
  List,
  Kanban,
  Plus,
  CheckSquare,
  X,
  Loader2,
  ArrowLeft,
  Trash2,
  Clock,
  Folder,
  User as UserIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from "@hello-pangea/dnd";

export default function ProjectDetailsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { defaultView, t } = useSettings();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [viewMode, setViewMode] = useState<"list" | "kanban">(defaultView);

  useEffect(() => {
    setViewMode(defaultView);
  }, [defaultView]);

  // Modal State'leri
  const todayStr = new Date().toISOString().split("T")[0];
  const defaultAssignee =
    currentUser?.displayName || currentUser?.email?.split("@")[0] || "";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"Düşük" | "Orta" | "Yüksek">("Orta");
  const [startDate, setStartDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(todayStr);
  const [assignedTo, setAssignedTo] = useState(defaultAssignee);
  const [selectedTagId, setSelectedTagId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleOpenTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  useEffect(() => {
    if (defaultAssignee && !assignedTo) {
      setAssignedTo(defaultAssignee);
    }
  }, [defaultAssignee]);

  useEffect(() => {
    if (!currentUser?.uid) return;
    const unsubTags = subscribeTags(currentUser.uid, (fetchedTags) => {
      setTags(fetchedTags);
    });
    return () => unsubTags();
  }, [currentUser]);

  useEffect(() => {
    if (!projectId) return;

    const unsubscribeProject = subscribeProjectById(projectId, (proj: Project | null) => {
      setProject(proj);
    });

    const unsubscribeTasks = subscribeProjectTasks(projectId, (fetchedTasks) => {
      setTasks(fetchedTasks);
      setLoading(false);
    });

    return () => {
      unsubscribeProject();
      unsubscribeTasks();
    };
  }, [projectId]);

  const handleResetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("Orta");
    setStartDate(todayStr);
    setDueDate(todayStr);
    setSelectedTagId("");
    setAssignedTo(defaultAssignee);
    setIsModalOpen(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !title.trim()) return;

    const chosenTag = tags.find((tItem) => tItem.id === selectedTagId);

    setSubmitting(true);
    try {
      await createTask({
        projectId,
        title: title.trim(),
        description: description.trim(),
        priority,
        status: "Yapılacak",
        startDate: startDate || todayStr,
        dueDate: dueDate || todayStr,
        assignedTo: assignedTo.trim() || defaultAssignee,
        assignee: currentUser
          ? {
              uid: currentUser.uid,
              displayName: assignedTo.trim() || defaultAssignee,
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

      toast.success("Görev Oluşturuldu", {
        description: `"${title.trim()}" listeye eklendi.`,
      });

      handleResetForm();
    } catch (err: any) {
      console.error("Görev oluşturulurken hata:", err);
      toast.error("Görev Oluşturulamadı", {
        description: err?.message || "Beklenmeyen bir hata meydana geldi.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (
    e: React.ChangeEvent<HTMLSelectElement>,
    taskId: string
  ) => {
    e.stopPropagation();
    const newStatus = e.target.value as Task["status"];
    try {
      await updateTask(taskId, { status: newStatus });
      toast.success("Durum Güncellendi", {
        description: `Görev "${newStatus}" sütununa taşındı.`,
      });
    } catch (err: any) {
      console.error("Durum güncellenirken hata:", err);
      toast.error("Durum Güncellenemedi");
    }
  };

  const handleOnDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as Task["status"];

    // Optimistic UI Update
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTask(draggableId, { status: newStatus });
    } catch (err) {
      console.error("Sürükle-bırak durum güncellenirken hata:", err);
      toast.error("Taşıma kaydedilemedi");
    }
  };

  const handleDeleteTask = (e: React.MouseEvent, taskId: string, taskTitle?: string) => {
    e.stopPropagation();

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
          } catch (err: any) {
            console.error("Görev silinirken hata:", err);
            toast.error("Görev Silinemedi");
          }
        },
      },
      cancel: {
        label: "Vazgeç",
        onClick: () => {},
      },
    });
  };

  const columns: { id: Task["status"]; title: string; color: string }[] = [
    { id: "Yapılacak", title: t("todo"), color: "bg-slate-500" },
    { id: "Devam Ediyor", title: t("inProgress"), color: "bg-amber-500" },
    { id: "Tamamlandı", title: t("completed"), color: "bg-emerald-500" },
  ];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <ProjectDetailsSkeleton viewMode={viewMode} />
      </div>
    );
  }

  return (
    <PageTransition className="space-y-6 sm:space-y-8 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Üst Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {t("backToProjects")}
          </button>
          
          <div className="flex items-center gap-3">
            {project?.icon ? (
              <span className="text-2xl p-2 bg-primary/10 rounded-2xl border border-primary/20 shrink-0 leading-none">
                {project.icon}
              </span>
            ) : (
              <div className="p-2 bg-primary/10 rounded-2xl border border-primary/20 text-primary shrink-0">
                <Folder className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2 sm:gap-3 flex-wrap">
                <span>{project?.title || t("tasksPageTitle")}</span>
                {project?.category && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
                    {project.category}
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {t("projectTasksDesc")}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {/* Görünüm Değiştirici */}
          <div className="flex bg-secondary p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "list"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="w-4 h-4" />
              <span>{t("listViewBtn")}</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "kanban"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>{t("kanbanViewBtn")}</span>
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-primary/20 transition cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{t("newTaskBtn")}</span>
          </motion.button>
        </div>
      </div>

      {/* Görünüm Alanı */}
      {viewMode === "list" ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-fade-in">
          <div className="p-4 border-b border-border grid grid-cols-12 text-xs font-bold text-muted-foreground uppercase">
            <span className="col-span-5">{t("taskNameColumn")}</span>
            <span className="col-span-2">{t("priorityLabel")}</span>
            <span className="col-span-3">{t("statusLabel")}</span>
            <span className="col-span-2 text-right">{t("dueDate")}</span>
          </div>

          <div className="divide-y divide-border">
            {tasks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-8">
                {t("noTasksInProject")}
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleOpenTaskDetail(task)}
                  className="group p-4 grid grid-cols-12 items-center text-sm hover:bg-secondary/40 transition cursor-pointer"
                >
                  <div className="col-span-5 flex items-center space-x-3 font-semibold text-foreground">
                    <CheckSquare className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{task.title}</span>
                    {task.tagName && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${
                          task.tagColor || "bg-primary"
                        }`}
                      >
                        #{task.tagName}
                      </span>
                    )}
                    {task.subtaskCount ? (
                      <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded-md font-normal shrink-0">
                        {task.completedSubtaskCount || 0}/{task.subtaskCount}
                      </span>
                    ) : null}
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${
                        task.priority === "Yüksek"
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          : task.priority === "Orta"
                          ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                          : "bg-secondary text-muted-foreground border border-border"
                      }`}
                    >
                      {t(task.priority === "Yüksek" ? "high" : task.priority === "Orta" ? "medium" : "low")}
                    </span>
                  </div>

                  <div className="col-span-3">
                    <select
                      value={task.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(e, task.id!)}
                      className="bg-secondary border border-border text-xs font-semibold rounded-lg px-2.5 py-1 text-foreground focus:ring-2 focus:ring-primary cursor-pointer"
                    >
                      <option value="Yapılacak">{t("todo")}</option>
                      <option value="Devam Ediyor">{t("inProgress")}</option>
                      <option value="Tamamlandı">{t("completed")}</option>
                    </select>
                  </div>

                  <div className="col-span-2 flex items-center justify-end space-x-2 text-xs text-muted-foreground font-medium">
                    <span>{task.dueDate}</span>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTask(e, task.id!, task.title)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                      title="Görevi Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleOnDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
            {columns.map((col) => {
              const columnTasks = tasks.filter((t) => t.status === col.id);

              return (
                <div
                  key={col.id}
                  className="bg-card border border-border p-4 rounded-2xl space-y-4 flex flex-col shadow-sm min-h-[500px]"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                      <h3 className="font-bold text-sm text-foreground">
                        {col.title}
                      </h3>
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-muted-foreground">
                      {columnTasks.length}
                    </span>
                  </div>

                  <Droppable droppableId={col.id}>
                    {(provided, snapshot) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className={`flex-1 space-y-3 transition-colors rounded-xl p-1 ${
                          snapshot.isDraggingOver ? "bg-primary/5" : ""
                        }`}
                      >
                        {columnTasks.map((task, index) => (
                          <Draggable
                            key={task.id}
                            draggableId={task.id!}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => handleOpenTaskDetail(task)}
                                className={`group bg-secondary/30 hover:bg-secondary/60 p-4 rounded-xl border border-border space-y-3 transition cursor-pointer ${
                                  snapshot.isDragging
                                    ? "shadow-2xl ring-2 ring-primary bg-card"
                                    : ""
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <h4
                                    className={`text-xs font-semibold text-foreground ${
                                      task.status === "Tamamlandı"
                                        ? "line-through text-muted-foreground"
                                        : ""
                                    }`}
                                  >
                                    {task.title}
                                  </h4>
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteTask(e, task.id!, task.title)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-rose-500 transition cursor-pointer"
                                    title="Görevi Sil"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {task.description && (
                                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                                    {task.description}
                                  </p>
                                )}

                                <div className="flex items-center justify-between text-[10px] pt-2 border-t border-border">
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={`font-semibold px-2 py-0.5 rounded ${
                                        task.priority === "Yüksek"
                                          ? "bg-rose-500/10 text-rose-500"
                                          : task.priority === "Orta"
                                          ? "bg-amber-500/10 text-amber-500"
                                          : "bg-secondary text-muted-foreground"
                                      }`}
                                    >
                                      {t(task.priority === "Yüksek" ? "high" : task.priority === "Orta" ? "medium" : "low")}
                                    </span>
                                    {task.tagName && (
                                      <span
                                        className={`font-bold px-1.5 py-0.5 rounded text-white ${
                                          task.tagColor || "bg-primary"
                                        }`}
                                      >
                                        #{task.tagName}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" /> {task.dueDate}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      )}

      {/* Hızlı Görev Ekleme Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg p-5 sm:p-6 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-primary" />
                <span>{t("newTaskBtn")}</span>
              </h2>
              <button
                type="button"
                onClick={handleResetForm}
                className="p-1 text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 overflow-y-auto flex-1 pr-1">
              {/* Görev Başlığı */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  {t("taskNameColumn")}
                </label>
                <input
                  type="text"
                  placeholder="ör. Ana sayfa tasarımı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* Sorumlu Kişi ve Öncelik */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Sorumlu Kişi
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="ör. Ahmet Yılmaz"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full h-11 pl-10 pr-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    {t("priorityLabel")}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as "Düşük" | "Orta" | "Yüksek")
                    }
                    className="w-full h-11 px-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                  >
                    <option value="Düşük">{t("low")}</option>
                    <option value="Orta">{t("medium")}</option>
                    <option value="Yüksek">{t("high")}</option>
                  </select>
                </div>
              </div>

              {/* Etiket Seçimi */}
              {tags.length > 0 && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    {t("tagLabel") || "Etiket"}
                  </label>
                  <select
                    value={selectedTagId}
                    onChange={(e) => setSelectedTagId(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
                  >
                    <option value="">{t("noTagSelected") || "Etiket Seçilmedi"}</option>
                    {tags.map((tag) => (
                      <option key={tag.id} value={tag.id}>
                        #{tag.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Başlangıç ve Bitiş Tarihi */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                    <CalendarIcon className="w-3.5 h-3.5 text-rose-500" />
                    {t("dueDate")}
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                  />
                </div>
              </div>

              {/* Açıklama */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  {t("descriptionLabel")}
                </label>
                <textarea
                  rows={2}
                  placeholder="Göreve ait kısa not veya detaylar..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              {/* Butonlar */}
              <div className="flex justify-end space-x-3 pt-3 shrink-0">
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-secondary text-xs font-semibold cursor-pointer transition"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center space-x-2 cursor-pointer transition shadow-md shadow-primary/20"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{t("create")}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Görev Detay Modalı */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
      />
    </PageTransition>
  );
}
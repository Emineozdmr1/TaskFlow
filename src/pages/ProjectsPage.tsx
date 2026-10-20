import React, { useEffect, useState } from "react";
import { FolderPlus, Trash2, Folder, Clock, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { subscribeProjects, deleteProject } from "@/services/projectService";
import { subscribeAllTasks } from "@/services/taskService";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import type { Project, Task } from "@/types/project";
import CreateProjectModal from "@/components/CreateProjectModal";
import EditProjectModal from "@/components/EditProjectModal";
import { ProjectCardSkeleton } from "@/components/skeletons/ProjectCardSkeleton";
import PageTransition from "@/components/animations/PageTransition";
import {
  staggerContainer,
  cardVariant,
  interactiveCardProps,
} from "@/components/animations/motionVariants";
import { useNavigate } from "react-router-dom";

export default function ProjectsPage() {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEditProject, setSelectedEditProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribeProjects = subscribeProjects(
      currentUser.uid,
      (fetchedProjects) => {
        setProjects(fetchedProjects);

        const projectIds = fetchedProjects
          .map((p) => p.id)
          .filter((id): id is string => Boolean(id));

        if (projectIds.length > 0) {
          const safeProjectIds = projectIds.slice(0, 30);
          const unsubscribeTasks = subscribeAllTasks(safeProjectIds, (fetchedTasks) => {
            setTasks(fetchedTasks);
            setLoading(false);
          });
          return () => unsubscribeTasks();
        } else {
          setTasks([]);
          setLoading(false);
        }
      },
      (err) => {
        console.error("Projeler çekilemedi:", err);
        setLoading(false);
      }
    );

    return () => {
      if (unsubscribeProjects) unsubscribeProjects();
    };
  }, [currentUser]);

  const getProjectProgress = (projectId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projectId);
    if (projTasks.length === 0) return 0;
    const completed = projTasks.filter((t) => t.status === "Tamamlandı").length;
    return Math.round((completed / projTasks.length) * 100);
  };

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter((t) => t.projectId === projectId).length;
  };

  const handleEditClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setSelectedEditProject(project);
    setIsEditModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, projectId?: string, projectTitle?: string) => {
    e.stopPropagation();
    if (!projectId) return;

    toast("Projeyi silmek istediğinize emin misiniz?", {
      description: `"${projectTitle || "Proje"}" ve içindeki tüm görevler kaldırılacak.`,
      action: {
        label: "Sil",
        onClick: async () => {
          try {
            await deleteProject(projectId);
            toast.success("Proje Silindi", {
              description: `"${projectTitle || "Proje"}" başarıyla kaldırıldı.`,
            });
          } catch (error: any) {
            console.error("Proje silinirken hata:", error);
            toast.error("Proje Silinemedi", {
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

  const isRealImage = (coverImage?: string) => {
    if (!coverImage) return false;
    return coverImage.startsWith("http") || coverImage.startsWith("data:image");
  };

  const getGradientTheme = (project: Project) => {
    if (project.coverTheme) return project.coverTheme;
    if (project.coverImage && project.coverImage.includes("from-")) {
      return project.coverImage;
    }
    return "from-blue-600 to-indigo-600";
  };

  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto p-6">
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      <EditProjectModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedEditProject(null);
        }}
        project={selectedEditProject}
      />

      {/* Başlık ve Aksiyon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Folder className="w-7 h-7 text-primary" /> {t("projectsPageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("projectsPageSub")}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition shadow-md shadow-primary/20 cursor-pointer shrink-0"
        >
          <FolderPlus className="w-4 h-4" />
          <span>{t("newProjectBtn")}</span>
        </motion.button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <ProjectCardSkeleton key={idx} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-card border border-border rounded-2xl shadow-sm"
        >
          <Folder className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">
            {t("noProjectsFound")}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            {t("noProjectsSub")}
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            {t("createProjectBtn")}
          </button>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project) => {
            const progress = getProjectProgress(project.id!);
            const taskCount = getProjectTaskCount(project.id!);
            const hasRealImage = isRealImage(project.coverImage);
            const gradientClass = getGradientTheme(project);

            return (
              <motion.div
                key={project.id}
                variants={cardVariant}
                {...interactiveCardProps}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:border-primary/50 transition cursor-pointer flex flex-col justify-between"
              >
                <div className="relative h-32 w-full overflow-hidden">
                  {hasRealImage ? (
                    <img
                      src={project.coverImage}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-r ${gradientClass}`}
                    />
                  )}

                  <div className="absolute inset-0 p-4 flex justify-between items-start bg-gradient-to-b from-black/40 to-transparent">
                    <span className="px-2.5 py-1 bg-black/40 backdrop-blur-md text-white text-xs font-medium rounded-lg border border-white/20 flex items-center gap-1.5">
                      {project.icon && <span>{project.icon}</span>}
                      <span>{project.category}</span>
                    </span>
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition">
                      <button
                        type="button"
                        onClick={(e) => handleEditClick(e, project)}
                        className="p-1.5 bg-black/40 hover:bg-primary text-white rounded-lg transition cursor-pointer"
                        title="Düzenle"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, project.id, project.title)}
                        className="p-1.5 bg-black/40 hover:bg-rose-600 text-white rounded-lg transition cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-foreground group-hover:text-primary transition truncate text-base flex items-center gap-2">
                      {project.icon ? (
                        <span className="text-lg shrink-0 leading-none">{project.icon}</span>
                      ) : (
                        <Folder className="w-4 h-4 text-primary shrink-0" />
                      )}
                      <span className="truncate">{project.title}</span>
                    </h3>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5" /> {taskCount} {t("tasksCountText")}
                      </span>
                      <span className="font-bold text-foreground">
                        %{progress}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </PageTransition>
  );
}
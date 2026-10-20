import React, { useState, useEffect } from "react";
import {
  Search,
  Folder,
  CheckSquare,
  Calendar,
  Settings,
  ArrowRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { subscribeProjects } from "@/services/projectService";
import { subscribeAllTasks } from "@/services/taskService";
import type { Project, Task } from "@/types/project";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({
  isOpen,
  onClose,
}: GlobalSearchModalProps) {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Modal her açıldığında arama kutusunu sıfırla
  useEffect(() => {
    if (isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!currentUser?.uid || !isOpen) return;

    const unsubProjects = subscribeProjects(currentUser.uid, (fetchedProjects) => {
      setProjects(fetchedProjects);

      const projectIds = fetchedProjects
        .map((p) => p.id)
        .filter((id): id is string => Boolean(id));

      if (projectIds.length > 0) {
        const unsubTasks = subscribeAllTasks(projectIds, (fetchedTasks) => {
          setTasks(fetchedTasks);
        });
        return () => unsubTasks();
      } else {
        setTasks([]);
      }
    });

    return () => unsubProjects();
  }, [currentUser, isOpen]);

  // Klavyeden ESC veya Ctrl+K / Cmd+K ile kapatma
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && isOpen) {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const searchQuery = query.toLocaleLowerCase("tr").trim();

  // Filtrelenmiş Projeler ve Görevler
  const filteredProjects = searchQuery
    ? projects.filter((p) =>
        p.title.toLocaleLowerCase("tr").includes(searchQuery)
      )
    : projects.slice(0, 4); // Arama yapılmamışken son 4 projeyi göster

  const filteredTasks = searchQuery
    ? tasks.filter(
        (tItem) =>
          tItem.title.toLocaleLowerCase("tr").includes(searchQuery) ||
          (tItem.description &&
            tItem.description.toLocaleLowerCase("tr").includes(searchQuery))
      )
    : tasks.slice(0, 5); // Arama yapılmamışken son 5 görevi göster

  // Kısayol Sayfaları
  const pageShortcuts = [
    { name: t("projectsPageShortcut"), path: "/projects", icon: Folder },
    { name: t("allTasksShortcut"), path: "/tasks", icon: CheckSquare },
    { name: t("calendarShortcut"), path: "/calendar", icon: Calendar },
    { name: t("settingsShortcut"), path: "/settings", icon: Settings },
  ].filter((p) =>
    searchQuery ? p.name.toLocaleLowerCase("tr").includes(searchQuery) : true
  );

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Input Bar */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="w-5 h-5 text-primary shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder={t("globalSearchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition cursor-pointer text-xs font-semibold"
            >
              {t("clear") || "Temizle"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sonuç Alanı */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Projeler */}
          {filteredProjects.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">
                {t("projects")} ({filteredProjects.length})
              </span>
              {filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleNavigate(`/projects/${p.id}`)}
                  className="p-2.5 rounded-xl hover:bg-secondary/60 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Folder className="w-4 h-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      {p.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded bg-secondary">
                    {p.category}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Görevler */}
          {filteredTasks.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">
                {t("tasks")} ({filteredTasks.length})
              </span>
              {filteredTasks.map((tItem) => (
                <div
                  key={tItem.id}
                  onClick={() => handleNavigate(`/projects/${tItem.projectId}`)}
                  className="p-2.5 rounded-xl hover:bg-secondary/60 flex items-center justify-between transition cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate max-w-md">
                      {tItem.title}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      tItem.priority === "Yüksek"
                        ? "bg-rose-500/10 text-rose-500"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {t(
                      tItem.status === "Yapılacak"
                        ? "todo"
                        : tItem.status === "Devam Ediyor"
                        ? "inProgress"
                        : "completed"
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Sayfalar */}
          {pageShortcuts.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-muted-foreground uppercase px-2">
                {t("quickNavigation")}
              </span>
              {pageShortcuts.map((s) => {
                const IconComponent = s.icon;
                return (
                  <div
                    key={s.path}
                    onClick={() => handleNavigate(s.path)}
                    className="p-2.5 rounded-xl hover:bg-secondary/60 flex items-center justify-between transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <IconComponent className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground">
                        {s.name}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Hiçbir Sonuç Bulunamadıysa */}
          {filteredProjects.length === 0 &&
            filteredTasks.length === 0 &&
            pageShortcuts.length === 0 && (
              <p className="text-xs text-center text-muted-foreground py-8">
                "{query}" {t("noSearchResults")}
              </p>
            )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from "react";
import { Bell, AlertTriangle, Clock, CheckCircle2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { subscribeProjects } from "@/services/projectService";
import { subscribeAllTasks } from "@/services/taskService";
import type { Task } from "@/types/project";
import { useNavigate } from "react-router-dom";

export default function NotificationDropdown() {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubProjects = subscribeProjects(currentUser.uid, (fetchedProjects) => {
      const projectIds = fetchedProjects
        .map((p) => p.id)
        .filter((id): id is string => Boolean(id));

      if (projectIds.length > 0) {
        // Firestore 'in' sorgusu en fazla 30 eleman destekler
        const safeProjectIds = projectIds.slice(0, 30);
        const unsubTasks = subscribeAllTasks(safeProjectIds, (fetchedTasks) => {
          setTasks(fetchedTasks);
        });
        return () => unsubTasks();
      } else {
        setTasks([]);
      }
    });

    return () => unsubProjects();
  }, [currentUser]);

  // Dışarı tıklama (Click Outside) ve ESC ile kapatma kontrolü
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const todayStr = new Date().toISOString().split("T")[0];

  // Bildirime değer görevler (Geciken veya Bugün Teslim Edilecek Görevler)
  const notifications = tasks.filter((tItem) => {
    const isCompleted = tItem.status === "Tamamlandı";
    const isOverdue = tItem.dueDate < todayStr && !isCompleted;
    const isDueToday = tItem.dueDate === todayStr && !isCompleted;
    const isHighPriority = tItem.priority === "Yüksek" && !isCompleted;

    return isOverdue || isDueToday || isHighPriority;
  });

  useEffect(() => {
    if (notifications.length > 0) {
      setHasUnread(true);
    }
  }, [notifications.length]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasUnread(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bildirim Butonu */}
      <button
        type="button"
        onClick={handleToggle}
        className="p-2 rounded-xl border border-border hover:bg-secondary text-foreground transition relative cursor-pointer"
        title={t("notifications")}
      >
        <Bell className="w-4 h-4" />
        {hasUnread && notifications.length > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Bildirim Dropdown Penceresi */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-foreground">
              <Bell className="w-4 h-4 text-primary" />
              <span>{t("notificationsTitle")}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {notifications.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                <p className="text-xs font-medium text-foreground">
                  {t("noNotificationsText")}
                </p>
              </div>
            ) : (
              notifications.map((task) => {
                const isOverdue = task.dueDate < todayStr;
                const isDueToday = task.dueDate === todayStr;

                return (
                  <div
                    key={task.id}
                    onClick={() => {
                      navigate(`/projects/${task.projectId}`);
                      setIsOpen(false);
                    }}
                    className="p-3.5 hover:bg-secondary/50 transition cursor-pointer space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          isOverdue
                            ? "bg-rose-500/10 text-rose-500"
                            : isDueToday
                            ? "bg-amber-500/10 text-amber-500"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {isOverdue
                          ? t("overdueTag")
                          : isDueToday
                          ? t("dueTodayTag")
                          : t("highPriorityTag")}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {task.dueDate}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-foreground truncate">
                      {task.title}
                    </h4>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { subscribeProjects } from "@/services/projectService";
import { subscribeAllTasks } from "@/services/taskService";
import type { Project, Task } from "@/types/project";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Filter,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import TaskDetailModal from "@/components/TaskDetailModal";
import PageTransition from "@/components/animations/PageTransition";
import { CalendarSkeleton } from "@/components/skeletons/CalendarSkeleton";

export default function CalendarPage() {
  const { currentUser } = useAuth();
  const { t, language } = useSettings();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Tarih ve Filtre State'leri
  const [currentDate, setCurrentDate] = useState(new Date());
  const [priorityFilter, setPriorityFilter] = useState<string>("Tümü");

  // Detay Modalı
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubProjects = subscribeProjects(currentUser.uid, (fetchedProjects) => {
      setProjects(fetchedProjects);

      const projectIds = fetchedProjects
        .map((p) => p.id)
        .filter((id): id is string => Boolean(id));

      if (projectIds.length > 0) {
        // Firestore 'in' sorgusu en fazla 30 eleman destekler
        const safeProjectIds = projectIds.slice(0, 30);
        const unsubTasks = subscribeAllTasks(safeProjectIds, (fetchedTasks) => {
          setTasks(fetchedTasks);
          setLoading(false);
        });
        return () => unsubTasks();
      } else {
        setTasks([]);
        setLoading(false);
      }
    });

    return () => unsubProjects();
  }, [currentUser]);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNamesTr = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];
  const monthNamesEn = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const monthNames = language === "en" ? monthNamesEn : monthNamesTr;

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const daysArray = [];
  for (let i = 0; i < startOffset; i++) {
    daysArray.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(i);
  }

  const todayStr = new Date().toISOString().split("T")[0];

  const getTasksForDay = (day: number) => {
    const monthStr = String(month + 1).padStart(2, "0");
    const dayStr = String(day).padStart(2, "0");
    const formattedDate = `${year}-${monthStr}-${dayStr}`;

    return tasks.filter((t) => {
      const matchesDate = t.dueDate === formattedDate;
      const matchesPriority =
        priorityFilter === "Tümü" || t.priority === priorityFilter;
      return matchesDate && matchesPriority;
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <CalendarSkeleton />
      </div>
    );
  }

  return (
    <PageTransition className="space-y-6 max-w-7xl mx-auto p-6 pb-12">
      <TaskDetailModal
        task={selectedTask}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTask(null);
        }}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="w-7 h-7 text-primary" /> {t("calendarPageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("calendarPageSub")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-card border border-border p-1 rounded-xl shadow-sm">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 hover:bg-secondary rounded-lg transition cursor-pointer text-muted-foreground hover:text-foreground"
              title="Önceki Ay"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold px-3 text-foreground min-w-[110px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 hover:bg-secondary rounded-lg transition cursor-pointer text-muted-foreground hover:text-foreground"
              title="Sonraki Ay"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-card border border-border px-3 py-1.5 rounded-xl text-xs font-semibold text-foreground">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="Tümü">{t("allPriorities")}</option>
              <option value="Yüksek">{t("highPriority")}</option>
              <option value="Orta">{t("mediumPriority")}</option>
              <option value="Düşük">{t("lowPriority")}</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-fade-in">
        <div className="grid grid-cols-7 border-b border-border bg-secondary/40 text-center text-xs font-bold text-muted-foreground py-3">
          <span>{t("dayMon")}</span>
          <span>{t("dayTue")}</span>
          <span>{t("dayWed")}</span>
          <span>{t("dayThu")}</span>
          <span>{t("dayFri")}</span>
          <span>{t("daySat")}</span>
          <span>{t("daySun")}</span>
        </div>

        <div className="grid grid-cols-7 divide-x divide-y divide-border">
          {daysArray.map((day, idx) => {
            if (day === null) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[110px] bg-secondary/10"
                />
              );
            }

            const dayTasks = getTasksForDay(day);
            const isToday =
              new Date().getDate() === day &&
              new Date().getMonth() === month &&
              new Date().getFullYear() === year;

            return (
              <div
                key={`day-${day}`}
                className={`min-h-[110px] p-2 space-y-1.5 transition ${
                  isToday ? "bg-primary/5" : "hover:bg-secondary/20"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {day}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      {dayTasks.length} {t("tasksCountText")}
                    </span>
                  )}
                </div>

                <div className="space-y-1 max-h-[85px] overflow-y-auto">
                  {dayTasks.map((task) => {
                    const isCompleted = task.status === "Tamamlandı";
                    const isOverdue = task.dueDate < todayStr && !isCompleted;

                    return (
                      <div
                        key={task.id}
                        onClick={() => {
                          setSelectedTask(task);
                          setIsDetailModalOpen(true);
                        }}
                        className={`p-1.5 rounded-lg border text-[10px] font-semibold flex items-center justify-between gap-1 transition cursor-pointer ${
                          isCompleted
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500 line-through opacity-70"
                            : isOverdue
                            ? "bg-rose-500/10 border-rose-500/30 text-rose-500 font-bold"
                            : task.priority === "Yüksek"
                            ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                            : "bg-secondary border-border text-foreground hover:bg-secondary/80"
                        }`}
                      >
                        <span className="truncate">{task.title}</span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                        ) : isOverdue ? (
                          <AlertTriangle className="w-3 h-3 text-rose-500 shrink-0" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { subscribeProjects } from "@/services/projectService";
import { subscribeAllTasks } from "@/services/taskService";
import type { Project, Task } from "@/types/project";
import { BarChart3, AlertTriangle, PieChart, Layers } from "lucide-react";
import { motion } from "framer-motion";
import PageTransition from "@/components/animations/PageTransition";
import { ReportsSkeleton } from "@/components/skeletons/ReportsSkeleton";

export default function ReportsPage() {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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

  const totalTasks = tasks.length;
  const todoTasks = tasks.filter((t) => t.status === "Yapılacak").length;
  const inProgressTasks = tasks.filter((t) => t.status === "Devam Ediyor").length;
  const completedTasks = tasks.filter((t) => t.status === "Tamamlandı").length;

  const highPriority = tasks.filter((t) => t.priority === "Yüksek").length;
  const mediumPriority = tasks.filter((t) => t.priority === "Orta").length;
  const lowPriority = tasks.filter((t) => t.priority === "Düşük").length;

  const getPercent = (val: number) =>
    totalTasks > 0 ? Math.round((val / totalTasks) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <ReportsSkeleton />
      </div>
    );
  }

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto p-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-primary" /> {t("reportsPageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("reportsPageSub")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Görev Durum Oranları */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <PieChart className="w-5 h-5 text-primary" /> {t("taskStatusRatio")}
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{t("todo")} ({todoTasks})</span>
                <span className="text-foreground">%{getPercent(todoTasks)}</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-slate-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getPercent(todoTasks)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{t("inProgress")} ({inProgressTasks})</span>
                <span className="text-foreground">%{getPercent(inProgressTasks)}</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getPercent(inProgressTasks)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{t("completed")} ({completedTasks})</span>
                <span className="text-foreground">%{getPercent(completedTasks)}</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-emerald-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getPercent(completedTasks)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Öncelik Analizi */}
        <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> {t("priorityAnalysis")}
          </h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-rose-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {t("highPriority")} ({highPriority})
                </span>
                <span className="text-foreground">%{getPercent(highPriority)}</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-rose-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getPercent(highPriority)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-amber-500">{t("mediumPriority")} ({mediumPriority})</span>
                <span className="text-foreground">%{getPercent(mediumPriority)}</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-amber-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getPercent(mediumPriority)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">{t("lowPriority")} ({lowPriority})</span>
                <span className="text-foreground">%{getPercent(lowPriority)}</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-slate-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${getPercent(lowPriority)}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
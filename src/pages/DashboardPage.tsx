import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { subscribeProjects } from "@/services/projectService";
import { subscribeAllTasks } from "@/services/taskService";
import type { Project, Task } from "@/types/project";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  PieChart as PieIcon,
  BarChart2,
  CalendarX,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import PageTransition from "@/components/animations/PageTransition";
import {
  staggerContainer,
  cardVariant,
  interactiveCardProps,
} from "@/components/animations/motionVariants";

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const navigate = useNavigate();

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

  // Metrik Hesaplamaları
  const totalProjects = projects.length;
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter((t) => t.status === "Tamamlandı").length;
  const todoTasks = tasks.filter((t) => t.status === "Yapılacak").length;
  const inProgressTasks = tasks.filter((t) => t.status === "Devam Ediyor").length;

  const todayStr = new Date().toISOString().split("T")[0];

  const urgentOrOverdueTasks = tasks.filter(
    (t) => (t.dueDate < todayStr || t.priority === "Yüksek") && t.status !== "Tamamlandı"
  );

  // Grafik Verileri
  const statusPieData = [
    { name: t("todo"), value: todoTasks, color: "#94a3b8" },
    { name: t("inProgress"), value: inProgressTasks, color: "#f59e0b" },
    { name: t("completed"), value: completedTasks, color: "#10b981" },
  ].filter((item) => item.value > 0);

  const priorityBarData = [
    {
      name: t("high"),
      count: tasks.filter((t) => t.priority === "Yüksek").length,
      fill: "#f43f5e",
    },
    {
      name: t("medium"),
      count: tasks.filter((t) => t.priority === "Orta").length,
      fill: "#f59e0b",
    },
    {
      name: t("low"),
      count: tasks.filter((t) => t.priority === "Düşük").length,
      fill: "#64748b",
    },
  ];

  const getProjectProgress = (projectId: string) => {
    const projTasks = tasks.filter((t) => t.projectId === projectId);
    if (projTasks.length === 0) return 0;
    const completed = projTasks.filter((t) => t.status === "Tamamlandı").length;
    return Math.round((completed / projTasks.length) * 100);
  };

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto min-h-screen text-foreground pb-12 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-primary" /> {t("overviewTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("overviewSub")}
        </p>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stat Cards Grid (Staggered Animation) */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            <motion.div
              variants={cardVariant}
              {...interactiveCardProps}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-default"
            >
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("totalProjects")}
                </p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {totalProjects}
                </h3>
              </div>
              <div className="p-3 bg-primary/10 text-primary rounded-xl">
                <FolderKanban className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div
              variants={cardVariant}
              {...interactiveCardProps}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-default"
            >
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("totalTasks")}
                </p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {totalTasks}
                </h3>
              </div>
              <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div
              variants={cardVariant}
              {...interactiveCardProps}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-default"
            >
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("completedTasks")}
                </p>
                <h3 className="text-2xl font-bold text-foreground mt-1">
                  {completedTasks}
                </h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </motion.div>

            <motion.div
              variants={cardVariant}
              {...interactiveCardProps}
              className="bg-card border border-border p-5 rounded-2xl shadow-sm flex items-center justify-between cursor-default"
            >
              <div>
                <p className="text-[10px] font-bold text-rose-500 uppercase flex items-center gap-1 tracking-wider">
                  {t("urgentOverdue")}
                </p>
                <h3 className="text-2xl font-bold text-rose-500 mt-1">
                  {urgentOrOverdueTasks.length}
                </h3>
              </div>
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl">
                <CalendarX className="w-6 h-6" />
              </div>
            </motion.div>
          </motion.div>

          {/* Grafikler Alanı */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-primary" /> {t("taskStatusRatio")}
              </h3>
              {totalTasks === 0 ? (
                <p className="text-xs text-muted-foreground py-12 text-center">
                  {t("noChartData")}
                </p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 text-xs font-semibold pt-2">
                    {statusPieData.map((item) => (
                      <div key={item.name} className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">
                          {item.name} ({item.value})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-primary" /> {t("priorityAnalysis")}
              </h3>
              {totalTasks === 0 ? (
                <p className="text-xs text-muted-foreground py-12 text-center">
                  {t("noChartData")}
                </p>
              ) : (
                <div className="h-64 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityBarData}>
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                      <YAxis stroke="#94a3b8" fontSize={12} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {priorityBarData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* Alt İçerik: Projeler ve Acil Görevler */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground">
                  {t("activeProjects")}
                </h2>
                <button
                  type="button"
                  onClick={() => navigate("/projects")}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {t("seeAll")} <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {projects.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  {t("noProjects")}
                </p>
              ) : (
                <div className="space-y-4">
                  {projects.slice(0, 4).map((project) => {
                    const progress = getProjectProgress(project.id!);
                    return (
                      <div
                        key={project.id}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="p-4 rounded-xl border border-border hover:bg-secondary/40 transition cursor-pointer flex items-center justify-between"
                      >
                        <div className="space-y-1">
                          <h4 className="text-sm font-semibold text-foreground">
                            {project.title}
                          </h4>
                          <span className="text-[11px] text-muted-foreground font-medium">
                            {project.category}
                          </span>
                        </div>
                        <div className="w-32 space-y-1 text-right">
                          <span className="text-xs font-semibold text-foreground">
                            %{progress}
                          </span>
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
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> {t("urgentTasksTitle")}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
                  {urgentOrOverdueTasks.length}
                </span>
              </div>

              {urgentOrOverdueTasks.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  {t("noUrgentTasks")}
                </p>
              ) : (
                <div className="space-y-3">
                  {urgentOrOverdueTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/projects/${task.projectId}`)}
                      className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 hover:border-rose-500/40 transition cursor-pointer space-y-1"
                    >
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {task.title}
                      </h4>
                      <div className="flex items-center justify-between text-[10px] text-rose-500 font-medium">
                        <span>{t("dueDate")} {task.dueDate}</span>
                        <span>{t(task.status === "Yapılacak" ? "todo" : task.status === "Devam Ediyor" ? "inProgress" : "completed")}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </PageTransition>
  );
}
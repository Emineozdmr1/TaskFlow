import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { subscribeTags, createTag, deleteTag } from "@/services/tagService";
import { subscribeAllTasks } from "@/services/taskService";
import { subscribeProjects } from "@/services/projectService";
import type { TagItem, Task, Project } from "@/types/project";
import { Tag, Plus, Trash2, X, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import PageTransition from "@/components/animations/PageTransition";
import { TagsSkeleton } from "@/components/skeletons/TagsSkeleton";
import {
  staggerContainer,
  cardVariant,
  interactiveCardProps,
} from "@/components/animations/motionVariants";

export default function TagsPage() {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const [tags, setTags] = useState<TagItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tagName, setTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-blue-500");
  const [submitting, setSubmitting] = useState(false);

  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-amber-500",
    "bg-purple-500",
    "bg-indigo-500",
  ];

  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubTags = subscribeTags(currentUser.uid, (fetchedTags) => {
      setTags(fetchedTags);
    });

    const unsubProjects = subscribeProjects(currentUser.uid, (fetchedProjects) => {
      setProjects(fetchedProjects);
      const projectIds = fetchedProjects.map((p) => p.id!).filter(Boolean);

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

    return () => {
      unsubTags();
      unsubProjects();
    };
  }, [currentUser]);

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.uid || !tagName.trim()) return;

    try {
      setSubmitting(true);
      await createTag(currentUser.uid, tagName.trim(), selectedColor);
      toast.success("Etiket Oluşturuldu", {
        description: `"#${tagName.trim()}" etiketi kullanıma hazır.`,
      });
      setTagName("");
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Etiket eklenirken hata:", err);
      toast.error("Etiket Oluşturulamadı", {
        description: err?.message || "İşlem sırasında bir hata oluştu.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTag = (e: React.MouseEvent, tagId: string, name: string) => {
    e.stopPropagation();

    toast("Etiketi silmek istediğinize emin misiniz?", {
      description: `"#${name}" etiketi kalıcı olarak kaldırılacak.`,
      action: {
        label: "Sil",
        onClick: async () => {
          try {
            await deleteTag(tagId);
            if (selectedTag === tagId) setSelectedTag(null);
            toast.success("Etiket Silindi", {
              description: `"#${name}" başarıyla kaldırıldı.`,
            });
          } catch (err: any) {
            console.error("Etiket silinirken hata:", err);
            toast.error("Etiket Silinemedi");
          }
        },
      },
      cancel: {
        label: "Vazgeç",
        onClick: () => {},
      },
    });
  };

  const filteredTasks = selectedTag
    ? tasks.filter((t) => t.tagId === selectedTag)
    : tasks;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <TagsSkeleton />
      </div>
    );
  }

  return (
    <PageTransition className="space-y-8 max-w-7xl mx-auto p-6 pb-12">
      {/* Üst Başlık ve Yeni Etiket Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Tag className="w-7 h-7 text-primary" /> {t("tagsPageTitle")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("tagsPageSub")}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition shadow-md shadow-primary/20 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t("newTagBtn")}</span>
        </motion.button>
      </div>

      {/* Etiket Kartları Izgarası */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        {/* Tümü Seçeneği */}
        <motion.div
          variants={cardVariant}
          {...interactiveCardProps}
          onClick={() => setSelectedTag(null)}
          className={`p-5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
            selectedTag === null
              ? "bg-primary/10 border-primary text-primary shadow-sm"
              : "bg-card border-border hover:border-primary/40 text-foreground"
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="w-3.5 h-3.5 rounded-full bg-slate-400" />
            <h3 className="font-bold text-sm">{t("allTasksTitle")}</h3>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 bg-secondary rounded-md">
            {tasks.length} {t("tasksCountText")}
          </span>
        </motion.div>

        {/* Dinamik Etiketler */}
        {tags.map((tag) => {
          const tagTasksCount = tasks.filter((t) => t.tagId === tag.id).length;
          const isSelected = selectedTag === tag.id;

          return (
            <motion.div
              key={tag.id}
              variants={cardVariant}
              {...interactiveCardProps}
              onClick={() => setSelectedTag(tag.id!)}
              className={`group p-5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                isSelected
                  ? "bg-primary/10 border-primary text-primary shadow-sm"
                  : "bg-card border-border hover:border-primary/40 text-foreground"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className={`w-3.5 h-3.5 rounded-full ${tag.color}`} />
                <div>
                  <h3 className="font-bold text-sm">#{tag.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {tagTasksCount} {t("usedInTasks")}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={(e) => handleDeleteTag(e, tag.id!, tag.name)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-rose-500 transition rounded-lg hover:bg-secondary cursor-pointer"
                title="Etiketi Sil"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Seçili Etikete Ait Görevler */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm animate-fade-in">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-primary" />
          {selectedTag
            ? `'${tags.find((t) => t.id === selectedTag)?.name}'`
            : t("allTasksTitle")}
        </h3>

        {filteredTasks.length === 0 ? (
          <p className="text-xs text-muted-foreground py-6 text-center">
            {t("noTagTasks")}
          </p>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="p-3.5 rounded-xl bg-secondary/30 border border-border hover:border-primary/30 transition flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-foreground">
                    {task.title}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {t(
                      task.status === "Yapılacak"
                        ? "todo"
                        : task.status === "Devam Ediyor"
                        ? "inProgress"
                        : "completed"
                    )}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Yeni Etiket Modalı */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">
                {t("addTagModalTitle")}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTag} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  {t("tagNameLabel")}
                </label>
                <input
                  type="text"
                  placeholder="Örn: Frontend, Acil, Hata"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  required
                  className="w-full h-10 px-3.5 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  {t("colorSelectLabel")}
                </label>
                <div className="flex items-center gap-3 pt-1">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`w-7 h-7 rounded-full ${c} transition cursor-pointer ${
                        selectedColor === c
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-card scale-110"
                          : "opacity-70 hover:opacity-100"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary rounded-xl transition cursor-pointer"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition cursor-pointer shadow-md shadow-primary/20"
                >
                  {submitting ? "Ekleniyor..." : t("create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  FolderPlus,
  Image as ImageIcon,
  Palette,
  Loader2,
  Upload,
  AlertCircle,
  FolderKanban,
  Briefcase,
  Rocket,
  Code2,
  Target,
} from "lucide-react";
import { toast } from "sonner";
import { createProject } from "@/services/projectService";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import {
  projectSchema,
  PROJECT_ICONS,
  type ProjectFormValues,
  type ProjectIconType,
} from "@/validations/projectSchema";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICON_COMPONENTS: Record<ProjectIconType, React.ElementType> = {
  FolderKanban,
  Briefcase,
  Rocket,
  Code2,
  Palette,
  Target,
};

export default function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const { currentUser } = useAuth();
  const { t } = useSettings();
  const [loading, setLoading] = useState(false);

  const themes = [
    { name: "Mavi-İndigo", value: "from-blue-600 to-indigo-600" },
    { name: "Yeşil-Zümrüt", value: "from-emerald-500 to-teal-700" },
    { name: "Mor-Pembe", value: "from-purple-600 to-pink-600" },
    { name: "Turuncu-Kırmızı", value: "from-amber-500 to-rose-600" },
    { name: "Koyu-Gri", value: "from-slate-700 to-slate-900" },
  ];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      category: "Yazılım",
      coverTheme: "from-blue-600 to-indigo-600",
      coverIcon: "FolderKanban",
      coverImage: "",
    },
  });

  const selectedTheme = watch("coverTheme");
  const selectedIcon = watch("coverIcon");
  const selectedImage = watch("coverImage");

  // Görsel Sıkıştırma (Base64 Boyutunu Düşürme)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 500;
        const scaleFactor = MAX_WIDTH / img.width;

        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleFactor;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.6);
        setValue("coverImage", compressedBase64);
        toast.info("Kapak görseli seçildi ve optimize edildi.");
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit: SubmitHandler<ProjectFormValues> = async (data) => {
    if (!currentUser?.uid) {
      toast.error("Oturum Bulunamadı", {
        description: "Lütfen işlemi gerçekleştirmek için tekrar giriş yapın.",
      });
      return;
    }

    try {
      setLoading(true);

      const projectPayload = {
        title: data.title.trim(),
        category: data.category,
        progress: 0,
        taskCount: 0,
        coverTheme: data.coverTheme || "from-blue-600 to-indigo-600",
        coverIcon: data.coverIcon || "FolderKanban",
        coverImage: data.coverImage || "",
      };

      await createProject(currentUser.uid, projectPayload);

      toast.success("Proje Başarıyla Oluşturuldu", {
        description: `"${data.title.trim()}" projeniz çalışma alanına eklendi.`,
      });

      handleClose();
    } catch (error: any) {
      console.error("Proje oluşturulurken hata:", error);
      toast.error("Proje Oluşturulamadı", {
        description: error?.message || "Beklenmeyen bir hata meydana geldi.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center space-x-2 text-primary font-bold">
            <FolderPlus className="w-5 h-5" />
            <span>{t("createProjectTitle")}</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              {t("projectTitleLabel")}
            </label>
            <input
              type="text"
              placeholder="Örn: TaskFlow Web Uygulaması"
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

          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              {t("categoryLabel")}
            </label>
            <select
              {...register("category")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition cursor-pointer"
            >
              <option value="Yazılım">{t("softwareCat")}</option>
              <option value="Tasarım">{t("designCat")}</option>
              <option value="Pazarlama">{t("marketingCat")}</option>
              <option value="Kişisel">{t("personalCat")}</option>
            </select>
          </div>

          {/* İkon Seçimi */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
              Proje İkonu
            </label>
            <div className="flex items-center gap-2 pt-1">
              {PROJECT_ICONS.map((iconKey) => {
                const IconComponent = ICON_COMPONENTS[iconKey];
                const isSelected = selectedIcon === iconKey;
                return (
                  <button
                    key={iconKey}
                    type="button"
                    onClick={() => setValue("coverIcon", iconKey)}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20"
                        : "bg-secondary/40 text-muted-foreground border-border hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kapak Teması Seçimi */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" /> {t("coverThemeLabel")}
            </label>
            <div className="flex items-center gap-2 pt-1">
              {themes.map((tItem) => (
                <button
                  key={tItem.value}
                  type="button"
                  onClick={() => {
                    setValue("coverTheme", tItem.value);
                    setValue("coverImage", "");
                  }}
                  className={`w-7 h-7 rounded-full bg-gradient-to-r ${tItem.value} transition cursor-pointer ${
                    selectedTheme === tItem.value && !selectedImage
                      ? "ring-2 ring-primary ring-offset-2 ring-offset-card"
                      : "opacity-70 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Bilgisayardan Kapak Resmi Yükleme */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" /> {t("uploadCustomImage")}
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-border border-dashed rounded-xl bg-secondary/30 hover:bg-secondary/50 text-foreground text-xs font-semibold cursor-pointer transition">
                <Upload className="w-4 h-4 text-primary" />
                <span>{selectedImage ? t("imageSelected") : t("selectImage")}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
              {selectedImage && (
                <button
                  type="button"
                  onClick={() => setValue("coverImage", "")}
                  className="px-3 py-2.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                >
                  {t("remove")}
                </button>
              )}
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary rounded-xl transition cursor-pointer"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary hover:bg-primary/90 disabled:opacity-50 rounded-xl transition shadow-md shadow-primary/20 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t("creating")}</span>
                </>
              ) : (
                <span>{t("createProjectBtn")}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
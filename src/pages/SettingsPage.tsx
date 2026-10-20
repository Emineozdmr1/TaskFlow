import React, { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Settings,
  Bell,
  Trash2,
  ShieldCheck,
  Loader2,
  AlertTriangle,
  X,
  Globe,
  Palette,
  Download,
  LayoutGrid,
} from "lucide-react";
import { deleteUserAccountAndData } from "@/services/authService";
import { subscribeProjects } from "@/services/projectService";
import { subscribeAllTasks } from "@/services/taskService";
import PageTransition from "@/components/animations/PageTransition";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const {
    language,
    setLanguage,
    accentColor,
    setAccentColor,
    defaultView,
    setDefaultView,
    t,
  } = useSettings();

  const [urgentNotifs, setUrgentNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [soundNotifs, setSoundNotifs] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Veri Dışa Aktarma
  const handleExportData = async () => {
    if (!currentUser?.uid) return;
    try {
      setExporting(true);

      subscribeProjects(currentUser.uid, (projects) => {
        const projectIds = projects.map((p) => p.id!).filter(Boolean);

        if (projectIds.length === 0) {
          toast.info("İndirilecek veri bulunamadı.");
          setExporting(false);
          return;
        }

        const safeProjectIds = projectIds.slice(0, 30);
        subscribeAllTasks(safeProjectIds, (tasks) => {
          const exportPayload = {
            exportDate: new Date().toISOString(),
            userEmail: currentUser.email,
            projectsCount: projects.length,
            tasksCount: tasks.length,
            projects,
            tasks,
          };

          const dataStr =
            "data:text/json;charset=utf-8," +
            encodeURIComponent(JSON.stringify(exportPayload, null, 2));
          const downloadAnchor = document.createElement("a");
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute(
            "download",
            `taskflow_backup_${new Date().toISOString().split("T")[0]}.json`
          );
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();

          toast.success("Veriler İndirildi", {
            description: "Yedek dosyanız bilgisayarınıza kaydedildi.",
          });
          setExporting(false);
        });
      });
    } catch (err) {
      console.error("Veri indirilirken hata:", err);
      toast.error("Veriler indirilemedi.");
      setExporting(false);
    }
  };

  // Kalıcı Hesap Silme
  const handleConfirmDeleteAccount = async () => {
    if (confirmInput.trim().toUpperCase() !== "SİL") return;

    try {
      setDeleting(true);
      await deleteUserAccountAndData();
      toast.success("Hesabınız Silindi", {
        description: "Tüm verileriniz kalıcı olarak temizlendi.",
      });
      navigate("/register");
    } catch (error: any) {
      console.error("Hesap silinirken hata:", error);
      if (error.code === "auth/requires-recent-login") {
        toast.error("Yeniden Giriş Gerekli", {
          description: "Güvenlik gereği hesabınızı silmek için lütfen çıkış yapıp tekrar giriş yapın.",
        });
      } else {
        toast.error("Hesap Silinemedi", {
          description: error.message,
        });
      }
    } finally {
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const accentColors: { name: string; value: "blue" | "emerald" | "purple" | "amber"; class: string }[] = [
    { name: "Mavi", value: "blue", class: "bg-blue-600" },
    { name: "Zümrüt Yeşili", value: "emerald", class: "bg-emerald-600" },
    { name: "Mor", value: "purple", class: "bg-purple-600" },
    { name: "Amber", value: "amber", class: "bg-amber-500" },
  ];

  return (
    <PageTransition className="space-y-6 max-w-4xl mx-auto p-6 pb-12 relative">
      {/* Güvenlik Onay Modalı */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-5 relative">
            <button
              type="button"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setConfirmInput("");
              }}
              className="absolute right-4 top-4 p-1 text-muted-foreground hover:text-foreground rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 text-rose-500">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Hesabınızı Silmek İstiyor Musunuz?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Bu işlem geri alınamaz!
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed bg-secondary/50 p-3 rounded-xl border border-border">
              Hesabınızı sildiğinizde oluşturduğunuz tüm <b>projeler</b>,{" "}
              <b>görevler</b>, <b>etiketler</b> ve <b>dosyalar</b> kalıcı olarak
              silinecektir.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-muted-foreground uppercase">
                Onaylamak için aşağıya <span className="text-rose-500 font-bold">SİL</span> yazın:
              </label>
              <input
                type="text"
                placeholder="Örn: SİL"
                value={confirmInput}
                onChange={(e) => setConfirmInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setConfirmInput("");
                }}
                className="px-4 py-2 rounded-xl border border-border text-muted-foreground hover:bg-secondary text-xs font-semibold cursor-pointer transition"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteAccount}
                disabled={deleting || confirmInput.trim().toUpperCase() !== "SİL"}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
              >
                {deleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>{t("deleteAccount")}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-7 h-7 text-primary" /> {t("systemSettingsTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("systemSettingsDesc")}
        </p>
      </div>

      {/* Görünüm, Tema ve Renk */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Palette className="w-5 h-5 text-primary" /> {t("appearanceTheme")}
        </h2>

        {/* Dark/Light Mode */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border">
          <div>
            <h4 className="text-xs font-semibold text-foreground">
              {t("darkMode")}
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t("darkModeDesc")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              toggleTheme();
              toast.success("Tema güncellendi.");
            }}
            className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
              theme === "dark" ? "bg-primary justify-end" : "bg-secondary justify-start"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-white shadow-md" />
          </button>
        </div>

        {/* Vurgu Rengi */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border">
          <div>
            <h4 className="text-xs font-semibold text-foreground">
              {t("accentColor")}
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t("accentColorDesc")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {accentColors.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => {
                  setAccentColor(color.value);
                  toast.success(`${color.name} rengi seçildi.`);
                }}
                className={`w-6 h-6 rounded-full ${color.class} transition cursor-pointer ${
                  accentColor === color.value
                    ? "ring-2 ring-foreground ring-offset-2 ring-offset-card scale-110"
                    : "opacity-60 hover:opacity-100"
                }`}
                title={color.name}
              />
            ))}
          </div>
        </div>

        {/* Varsayılan Görünüm */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border">
          <div>
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-primary" /> {t("defaultView")}
            </h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t("defaultViewDesc")}
            </p>
          </div>

          <select
            value={defaultView}
            onChange={(e) => {
              setDefaultView(e.target.value as "kanban" | "list");
              toast.success("Varsayılan görünüm kaydedildi.");
            }}
            className="px-3 py-1.5 bg-background border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
          >
            <option value="kanban">{t("kanbanBoard")}</option>
            <option value="list">{t("listView")}</option>
          </select>
        </div>
      </div>

      {/* Dil Tercihleri */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Globe className="w-5 h-5 text-primary" /> {t("languageRegion")}
        </h2>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border">
          <div>
            <h4 className="text-xs font-semibold text-foreground">{t("appLanguage")}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {t("appLanguageDesc")}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setLanguage("tr");
                toast.success("Dil Türkçe olarak ayarlandı.");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                language === "tr"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              🇹🇷 Türkçe
            </button>
            <button
              type="button"
              onClick={() => {
                setLanguage("en");
                toast.success("Language set to English.");
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                language === "en"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              🇬🇧 English
            </button>
          </div>
        </div>
      </div>

      {/* Bildirim Tercihleri */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
          <Bell className="w-5 h-5 text-primary" /> {t("notifSettings")}
        </h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border">
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                {t("overdueAlert")}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t("overdueAlertDesc")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setUrgentNotifs(!urgentNotifs);
                toast.success("Bildirim tercihi güncellendi.");
              }}
              className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                urgentNotifs ? "bg-primary justify-end" : "bg-secondary justify-start"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border">
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                {t("emailNotifs")}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t("emailNotifsDesc")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setEmailNotifs(!emailNotifs);
                toast.success("E-posta bildirim ayarı güncellendi.");
              }}
              className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                emailNotifs ? "bg-primary justify-end" : "bg-secondary justify-start"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-secondary/30 border border-border">
            <div>
              <h4 className="text-xs font-semibold text-foreground">
                {t("soundNotifs")}
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t("soundNotifsDesc")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSoundNotifs(!soundNotifs);
                toast.success("Ses efekti ayarı güncellendi.");
              }}
              className={`w-12 h-6 rounded-full transition-colors p-1 cursor-pointer flex items-center ${
                soundNotifs ? "bg-primary justify-end" : "bg-secondary justify-start"
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-white shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* Veri Yedekleme ve Silme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Download className="w-5 h-5 text-primary" /> {t("downloadData")}
            </h2>
            <p className="text-xs text-muted-foreground pt-2">
              {t("downloadDataDesc")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportData}
            disabled={exporting}
            className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Download className="w-4 h-4 text-primary" />
                <span>{t("backupDownload")}</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 space-y-3 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-rose-500 flex items-center gap-2 border-b border-rose-500/20 pb-3">
              <ShieldCheck className="w-5 h-5" /> {t("dangerZone")}
            </h2>
            <p className="text-xs text-muted-foreground pt-1">
              {t("deleteAccountDesc")}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-semibold text-foreground">{t("deleteAccount")}</span>
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> {t("delete")}
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
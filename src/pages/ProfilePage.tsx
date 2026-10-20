import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/contexts/SettingsContext";
import { updateProfile, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/config";
import { toast } from "sonner";
import {
  User,
  Mail,
  ShieldCheck,
  Save,
  Loader2,
  KeyRound,
  Bell,
  Lock,
} from "lucide-react";
import PageTransition from "@/components/animations/PageTransition";

export default function ProfilePage() {
  const { currentUser } = useAuth();
  const { t } = useSettings();

  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);

  useEffect(() => {
    if (currentUser?.displayName) {
      setDisplayName(currentUser.displayName);
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      });
      toast.success("Profil Güncellendi", {
        description: "Adınız ve profil bilgileriniz kaydedildi.",
      });
    } catch (error: any) {
      console.error("Profil güncellenirken hata:", error);
      toast.error("Güncelleme Başarısız", {
        description: error?.message || "Bilgiler kaydedilemedi.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentUser?.email) return;

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      toast.success("E-posta Gönderildi", {
        description: `${currentUser.email} adresine şifre sıfırlama bağlantısı gönderildi.`,
      });
    } catch (error: any) {
      console.error("Şifre sıfırlama hatası:", error);
      toast.error("İşlem Başarısız", {
        description: error?.message || "E-posta gönderilemedi.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <PageTransition className="space-y-8 max-w-4xl mx-auto p-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <User className="w-7 h-7 text-primary" /> {t("profilePageTitle")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("profilePageSub")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sol Taraf: Profil Kartı Özeti */}
        <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center space-y-4 shadow-sm h-fit">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary font-bold text-2xl">
            {currentUser?.displayName
              ? currentUser.displayName.slice(0, 2).toUpperCase()
              : "US"}
          </div>
          <div>
            <h3 className="font-bold text-foreground text-base">
              {currentUser?.displayName || "Kullanıcı"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentUser?.email}
            </p>
          </div>
          <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full border border-primary/20">
            {t("proPlan")}
          </span>
        </div>

        {/* Sağ Taraf: Ayar Sekmeleri */}
        <div className="md:col-span-2 space-y-6">
          {/* Kişisel Bilgiler */}
          <form
            onSubmit={handleUpdateProfile}
            className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm"
          >
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <ShieldCheck className="w-5 h-5 text-primary" /> {t("personalInfo")}
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                {t("fullNameLabel")}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Ad Soyad"
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                {t("emailLabel")}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={currentUser?.email || ""}
                  disabled
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-secondary/50 text-muted-foreground text-xs cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl transition shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{t("saveChanges")}</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Güvenlik & Parola Değiştirme */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <KeyRound className="w-5 h-5 text-primary" /> {t("securityPassword")}
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("sendPasswordResetDesc")}
            </p>

            <button
              type="button"
              onClick={handlePasswordReset}
              disabled={resetLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
            >
              {resetLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4 text-primary" />
                  <span>{t("sendPasswordResetBtn")}</span>
                </>
              )}
            </button>
          </div>

          {/* Bildirim Tercihleri */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Bell className="w-5 h-5 text-primary" /> {t("notifSettings")}
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-foreground">
                  {t("emailNotifs")}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {t("emailNotifsDesc")}
                </p>
              </div>

              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => {
                  setEmailNotifications(e.target.checked);
                  toast.success("Bildirim tercihi güncellendi.");
                }}
                className="w-4 h-4 text-primary rounded border-border focus:ring-primary cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/config";
import { Link } from "react-router-dom";
import { CheckCircle2, ArrowLeft, Loader2, Mail, Sparkles, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/contexts/SettingsContext";
import PageTransition from "@/components/animations/PageTransition";

export default function ForgotPasswordPage() {
  const { t } = useSettings();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email.trim());
      toast.success("E-posta Gönderildi", {
        description: t("resetEmailSentSuccess") || "Şifre sıfırlama bağlantısı adresinize iletildi.",
      });
      setEmail("");
    } catch (err: any) {
      console.error("Şifre sıfırlama hatası:", err);
      toast.error("İşlem Başarısız", {
        description: t("resetEmailError") || "Bağlantı gönderilemedi. Lütfen adresi kontrol edin.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition className="min-h-screen w-full flex bg-slate-50 dark:bg-slate-900">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-primary font-bold text-2xl mb-6">
              <CheckCircle2 className="w-8 h-8 fill-primary text-primary-foreground" />
              <span>TaskFlow</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
              {t("forgotPasswordTitle")}
            </h1>
            <p className="text-sm text-muted-foreground">
              {t("forgotPasswordSub")}
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1 relative">
              <input
                type="email"
                placeholder={t("emailLabel")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 pl-11 pr-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
              />
              <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition shadow-lg shadow-primary/20 flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("sendResetLinkBtn")}
            </button>
          </form>

          <div className="pt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("backToLogin")}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Vektörel Panel */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent)]" />
        <div className="relative z-10 max-w-md text-center text-white space-y-6">
          <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto text-amber-300">
              <KeyRound className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-lg">Hesap Güvenliği</h3>
            <p className="text-xs text-white/80 leading-relaxed">
              Tek kullanımlık şifre sıfırlama bağlantısıyla hesabınıza dilediğiniz zaman güvenle yeniden erişebilirsiniz.
            </p>
          </div>

          <h2 className="text-2xl font-bold tracking-tight">{t("forgotPasswordHeroTitle")}</h2>
          <p className="text-white/80 text-sm leading-relaxed">
            {t("forgotPasswordHeroDesc")}
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
import React, { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase/config";
import { useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  BarChart3,
  Check,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/contexts/SettingsContext";
import PageTransition from "@/components/animations/PageTransition";

export default function LoginPage() {
  const { t } = useSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      toast.success("Giriş Yapıldı", {
        description: "TaskFlow çalışma alanına hoş geldiniz.",
      });
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Giriş hatası:", err);
      toast.error("Giriş Başarısız", {
        description: "E-posta adresi veya şifre hatalı.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success("Google ile Giriş Yapıldı");
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Google login error:", err);
      toast.error("Giriş Yapılamadı", {
        description: "Google ile giriş yapılırken bir hata oluştu.",
      });
    }
  };

  return (
    <PageTransition className="min-h-screen w-full flex bg-background text-foreground">
      {/* Sol Taraf - Giriş Formu */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-14">
        <div className="w-full max-w-md space-y-6">
          <div className="flex items-center space-x-2 text-primary font-bold text-2xl mb-8">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md shadow-primary/30">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <span>TaskFlow</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              Tekrar hoş geldin! <span className="inline-block animate-pulse">👋</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Hesabına giriş yaparak devam et.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div className="space-y-1">
              <input
                type="email"
                placeholder={t("emailLabel")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
              />
            </div>

            <div className="space-y-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder={t("passwordLabel")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 pl-4 pr-11 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs font-medium pt-1">
              <label className="flex items-center space-x-2 cursor-pointer text-muted-foreground">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
                <span>{t("rememberMe")}</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-primary hover:underline font-semibold"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition shadow-lg shadow-primary/25 flex items-center justify-center disabled:opacity-50 cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Giriş Yap"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-3 text-muted-foreground font-semibold">
                veya
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full h-12 rounded-xl border border-border bg-card hover:bg-secondary/60 text-foreground font-medium text-sm transition flex items-center justify-center space-x-3 cursor-pointer shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Google ile giriş yap</span>
          </button>

          <p className="text-center text-sm text-muted-foreground pt-3">
            Hesabın yok mu?{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Kayıt ol
            </Link>
          </p>
        </div>
      </div>

      {/* Sağ Taraf - Orijinal Tasarımdaki Pastel Mavi/3D Laptop Sahnesi */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-100 via-sky-200 to-indigo-300 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 p-12 items-center justify-center relative overflow-hidden">
        {/* Arka plan 3D Işık Halkaları & Havada Uçan 3D Elemanlar */}
        <div className="absolute top-12 left-16 w-16 h-16 rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-xl flex items-center justify-center text-primary rotate-[-12deg] border border-white/40">
          <BarChart3 className="w-8 h-8 text-blue-500" />
        </div>

        <div className="absolute top-24 right-20 w-12 h-12 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-lg flex items-center justify-center text-emerald-500 rotate-[15deg] border border-white/40">
          <CheckCircle2 className="w-6 h-6 fill-emerald-500 text-white" />
        </div>

        <div className="absolute bottom-16 left-12 w-14 h-14 rounded-2xl bg-white/80 dark:bg-white/10 backdrop-blur-md shadow-lg flex items-center justify-center text-amber-500 rotate-[8deg] border border-white/40">
          <Sparkles className="w-7 h-7 text-amber-400" />
        </div>

        {/* 3D Laptop Mockup Gövdesi */}
        <div className="relative z-10 w-full max-w-lg">
          <div className="bg-slate-900 rounded-t-2xl p-3 shadow-2xl border-4 border-slate-700/80">
            {/* Laptop Ekran Çerçevesi */}
            <div className="bg-card rounded-lg overflow-hidden border border-border shadow-inner">
              {/* Ekran Üst Bar */}
              <div className="bg-secondary/70 px-3 py-2 flex items-center justify-between border-b border-border">
                <div className="flex items-center space-x-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1 bg-background px-3 py-0.5 rounded-md border border-border">
                  taskflow.app/dashboard
                </div>
                <div className="w-8" />
              </div>

              {/* Ekran İçeriği (TaskFlow Dashboard Önizlemesi) */}
              <div className="p-4 space-y-3 bg-background/95">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Görev Paneli</h4>
                    <p className="text-[9px] text-muted-foreground">Aktif Sprint</p>
                  </div>
                  <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">
                    %84 Tamamlandı
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-2.5 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[11px] font-semibold text-foreground">Web Sitesi Tasarımı</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500">
                      Bitti
                    </span>
                  </div>

                  <div className="p-2.5 bg-card rounded-xl border border-border shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
                        <Clock className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[11px] font-semibold text-foreground">Mobil Uygulama API</span>
                    </div>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500">
                      Devam Ediyor
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-primary rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Laptop Klavye / Taban Gövdesi */}
          <div className="relative -mt-0.5 h-4 bg-gradient-to-b from-slate-400 to-slate-600 rounded-b-xl shadow-2xl mx-auto w-[105%] -left-[2.5%] flex items-center justify-center">
            <div className="w-16 h-1 bg-slate-300 rounded-full" />
          </div>
          {/* Laptop Alt Gölgesi */}
          <div className="w-[110%] h-4 bg-black/20 blur-md rounded-full mx-auto -mt-1" />
        </div>
      </div>
    </PageTransition>
  );
}
import React from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import PageTransition from "@/components/animations/PageTransition";

export default function NotFoundPage() {
  const { t } = useSettings();

  return (
    <PageTransition className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="text-center space-y-4 max-w-md animate-fade-in">
        <div className="p-4 bg-primary/10 text-primary rounded-2xl w-fit mx-auto border border-primary/20">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-5xl font-black tracking-tight text-foreground">404</h1>
        <h2 className="text-xl font-bold text-foreground">Sayfa Bulunamadı</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Aradığınız sayfa silinmiş, adı değiştirilmiş veya geçici olarak erişilemez durumda olabilir.
        </p>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold rounded-xl transition shadow-md shadow-primary/20 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t("dashboard")}'a Dön</span>
        </Link>
      </div>
    </PageTransition>
  );
}
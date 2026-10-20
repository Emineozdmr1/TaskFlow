import { Skeleton } from "@/components/ui/Skeleton";

export function ProjectCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm animate-fade-in">
      {/* İkon ve Kategori */}
      <div className="flex items-center justify-between">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <Skeleton className="w-20 h-5 rounded-full" />
      </div>

      {/* Proje Başlığı ve Alt Bilgi */}
      <div className="space-y-2 pt-1">
        <Skeleton className="w-3/4 h-5 rounded-lg" />
        <Skeleton className="w-1/2 h-3.5 rounded-lg" />
      </div>

      {/* İlerleme Çubuğu */}
      <div className="space-y-1.5 pt-2">
        <div className="flex justify-between">
          <Skeleton className="w-12 h-3 rounded" />
          <Skeleton className="w-8 h-3 rounded" />
        </div>
        <Skeleton className="w-full h-2 rounded-full" />
      </div>
    </div>
  );
}
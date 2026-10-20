import { Skeleton } from "@/components/ui/Skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 4'lü Metrik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="p-5 bg-card border border-border rounded-2xl space-y-3"
          >
            <div className="flex justify-between items-center">
              <Skeleton className="w-24 h-4 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
            <Skeleton className="w-16 h-7 rounded-lg" />
            <Skeleton className="w-32 h-3 rounded-md" />
          </div>
        ))}
      </div>

      {/* Grafik ve Son Görevler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 bg-card border border-border rounded-2xl space-y-4 h-80">
          <Skeleton className="w-40 h-5 rounded-md" />
          <Skeleton className="w-full h-56 rounded-xl" />
        </div>
        <div className="p-5 bg-card border border-border rounded-2xl space-y-3 h-80">
          <Skeleton className="w-32 h-5 rounded-md" />
          <div className="space-y-2.5 pt-2">
            {[1, 2, 3, 4].map((j) => (
              <Skeleton key={j} className="w-full h-11 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
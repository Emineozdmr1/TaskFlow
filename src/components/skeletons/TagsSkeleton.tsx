import { Skeleton } from "@/components/ui/Skeleton";

export function TagsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Üst Başlık ve Buton İskeleti */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="w-36 h-7 rounded-xl" />
          <Skeleton className="w-56 h-4 rounded-md" />
        </div>
        <Skeleton className="w-36 h-10 rounded-xl" />
      </div>

      {/* Etiket Kartları Izgarası */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border bg-card flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <Skeleton className="w-3.5 h-3.5 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="w-24 h-4 rounded-md" />
                <Skeleton className="w-16 h-3 rounded-md" />
              </div>
            </div>
            <Skeleton className="w-12 h-6 rounded-md" />
          </div>
        ))}
      </div>

      {/* Seçili Etiket Görev Listesi İskeleti */}
      <div className="bg-card border border-border rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Skeleton className="w-5 h-5 rounded-md" />
          <Skeleton className="w-32 h-5 rounded-md" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((j) => (
            <Skeleton key={j} className="w-full h-12 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
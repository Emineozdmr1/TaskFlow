import { Skeleton } from "@/components/ui/Skeleton";

export function CalendarSkeleton() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Başlık ve Ay Navigasyon İskeleti */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="w-36 h-7 rounded-xl" />
          <Skeleton className="w-56 h-4 rounded-md" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="w-44 h-10 rounded-xl" />
          <Skeleton className="w-32 h-10 rounded-xl" />
        </div>
      </div>

      {/* Takvim Izgarası İskeleti */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-border bg-secondary/40 p-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <Skeleton key={i} className="h-4 w-12 mx-auto rounded" />
          ))}
        </div>
        <div className="grid grid-cols-7 divide-x divide-y divide-border">
          {Array.from({ length: 35 }).map((_, idx) => (
            <div key={idx} className="min-h-[110px] p-2 space-y-2">
              <Skeleton className="w-6 h-6 rounded-full" />
              {idx % 3 === 0 && <Skeleton className="w-full h-5 rounded-md" />}
              {idx % 5 === 0 && <Skeleton className="w-3/4 h-5 rounded-md" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
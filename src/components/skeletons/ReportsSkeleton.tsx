import { Skeleton } from "@/components/ui/Skeleton";

export function ReportsSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Başlık İskeleti */}
      <div className="space-y-2">
        <Skeleton className="w-40 h-7 rounded-xl" />
        <Skeleton className="w-64 h-4 rounded-md" />
      </div>

      {/* Rapor Kartları İskeleti */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2].map((card) => (
          <div
            key={card}
            className="bg-card border border-border rounded-2xl p-6 space-y-6 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Skeleton className="w-5 h-5 rounded-md" />
              <Skeleton className="w-36 h-5 rounded-md" />
            </div>

            <div className="space-y-5">
              {[1, 2, 3].map((row) => (
                <div key={row} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="w-28 h-4 rounded" />
                    <Skeleton className="w-10 h-4 rounded" />
                  </div>
                  <Skeleton className="w-full h-2.5 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
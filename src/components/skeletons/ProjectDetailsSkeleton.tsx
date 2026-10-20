import { Skeleton } from "@/components/ui/skeleton";

export function ProjectDetailsSkeleton({ viewMode = "kanban" }: { viewMode?: "list" | "kanban" }) {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Üst Başlık ve Görünüm Seçici İskeleti */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="w-24 h-4 rounded-md" />
          <div className="flex items-center gap-3">
            <Skeleton className="w-48 h-7 rounded-xl" />
            <Skeleton className="w-20 h-6 rounded-lg" />
          </div>
          <Skeleton className="w-64 h-4 rounded-md" />
        </div>

        <div className="flex items-center space-x-3">
          <Skeleton className="w-36 h-10 rounded-xl" />
          <Skeleton className="w-28 h-10 rounded-xl" />
        </div>
      </div>

      {/* Görünüme Göre İskelet */}
      {viewMode === "list" ? (
        <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
          <Skeleton className="w-full h-8 rounded-xl" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="w-full h-14 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((col) => (
            <div
              key={col}
              className="bg-card border border-border p-4 rounded-2xl space-y-4 min-h-[450px]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <Skeleton className="w-28 h-5 rounded-md" />
                <Skeleton className="w-6 h-5 rounded-md" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <Skeleton key={item} className="w-full h-24 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
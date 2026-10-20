import { Skeleton } from "@/components/ui/skeleton";

export function TaskRowSkeleton() {
  return (
    <div className="p-4 bg-card rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
      <div className="flex items-start space-x-3 flex-1">
        <Skeleton className="w-5 h-5 rounded-full shrink-0 mt-0.5" />
        <div className="space-y-2 flex-1 max-w-md">
          <Skeleton className="w-3/4 h-4 rounded-md" />
          <Skeleton className="w-1/2 h-3 rounded-md" />
          <div className="flex items-center gap-2 pt-1">
            <Skeleton className="w-16 h-4 rounded-md" />
            <Skeleton className="w-20 h-3 rounded-md" />
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
        <Skeleton className="w-16 h-6 rounded-lg" />
        <Skeleton className="w-7 h-7 rounded-lg" />
      </div>
    </div>
  );
}
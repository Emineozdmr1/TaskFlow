import type { ReactNode } from "react";

type StatsCardProps = {
  title: string;
  value: number;
  icon: ReactNode;
};

function StatsCard({
  title,
  value,
  icon,
}: StatsCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {title}
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {value}
          </h2>
        </div>

        <div>{icon}</div>
      </div>
    </div>
  );
}

export default StatsCard;
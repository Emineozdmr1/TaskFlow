import { CheckCircle2 } from "lucide-react";

const tasks = [
  "React Router kurulumu",
  "Dashboard UI tasarımı",
  "Firebase Authentication",
  "Task CRUD geliştirme",
];

function RecentTasks() {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm">
      <h2 className="mb-5 text-xl font-semibold">
        Recent Tasks
      </h2>

      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task}
            className="flex items-center gap-3 rounded-lg border p-3"
          >
            <CheckCircle2 className="h-5 w-5 text-green-500" />

            <span>{task}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentTasks;
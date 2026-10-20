import {
  Briefcase,
  Code2,
  FolderKanban,
  Palette,
  Rocket,
  Target,
  type LucideIcon,
} from "lucide-react";

export const PROJECT_ICON_OPTIONS = [
  { value: "FolderKanban", label: "Kanban", Icon: FolderKanban },
  { value: "Briefcase", label: "Briefcase", Icon: Briefcase },
  { value: "Rocket", label: "Rocket", Icon: Rocket },
  { value: "Code2", label: "Code", Icon: Code2 },
  { value: "Palette", label: "Design", Icon: Palette },
  { value: "Target", label: "Target", Icon: Target },
] as const;

export type ProjectIconName = (typeof PROJECT_ICON_OPTIONS)[number]["value"];

export const getProjectIcon = (iconName?: string): LucideIcon => {
  const found = PROJECT_ICON_OPTIONS.find((item) => item.value === iconName);
  return found?.Icon ?? FolderKanban;
};

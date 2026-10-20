import {
    LayoutDashboard,
    FolderKanban,
    CheckSquare,
    CalendarDays,
    Settings,
  } from "lucide-react";
  
  export const navigation = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      title: "Projects",
      href: "/projects",
      icon: FolderKanban,
    },
    {
      title: "Tasks",
      href: "/tasks",
      icon: CheckSquare,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: CalendarDays,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];
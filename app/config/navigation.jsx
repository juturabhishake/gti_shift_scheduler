import {
  LayoutDashboard,
  ListTodo,
  Folder,
  FilePlus,
  FileText,
  Database,
  ShieldAlert,
  Info,
  LogOut,
  UserCog,
  AlertTriangle,
  Table2,
  History,
} from "lucide-react";

export const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  {
    title: "Initial Release Staging",
    url: "#",
    icon: Folder,
    items: [
      { title: "Create", url: "/product_matrix/create", icon: FilePlus },
      {
        title: "View",
        url: "#",
        icon: FileText,
        items: [
          { title: "All Lists", url: "/product_matrix/view/all_list", icon: Database },
          { title: "My Work List", url: "/product_matrix/view/my_work_list", icon: Database },
        ],
      },
    ],
  },
  { title: "Information", url: "/information", icon: Info },
  {
    title: "NG Major Issues",
    url: "#",
    icon: AlertTriangle,
    items: [
      { title: "Form", url: "/ng_major_issues/form", icon: FilePlus },
      { title: "My History", url: "/ng_major_issues/history", icon: History },
      { title: "All Issues View", url: "/ng_major_issues/view", icon: Table2 },
    ],
  },
];

export const navSecondaryItems = [
  { title: "Access Management", url: "/access_management", icon: ShieldAlert, adminOnly: true },
  { title: "Profile", url: "/account/profile", icon: UserCog },
];
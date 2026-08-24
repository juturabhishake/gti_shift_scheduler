export const taskStats = [
  { key: "total", label: "Total Tasks", value: "128", change: "+12.4%", up: true },
  { key: "completed", label: "Completed", value: "86", change: "+8.2%", up: true },
  { key: "pending", label: "Pending", value: "24", change: "-3.1%", up: false },
  { key: "inProgress", label: "In Progress", value: "18", change: "+5.6%", up: true },
];

export const trendData = [
  { day: "Mon", completed: 9, created: 12 },
  { day: "Tue", completed: 14, created: 8 },
  { day: "Wed", completed: 11, created: 15 },
  { day: "Thu", completed: 18, created: 9 },
  { day: "Fri", completed: 22, created: 11 },
  { day: "Sat", completed: 10, created: 4 },
  { day: "Sun", completed: 12, created: 6 },
];

export const monthlyActivity = [
  { month: "Jan", tasks: 42 },
  { month: "Feb", tasks: 58 },
  { month: "Mar", tasks: 51 },
  { month: "Apr", tasks: 76 },
  { month: "May", tasks: 69 },
  { month: "Jun", tasks: 94 },
  { month: "Jul", tasks: 88 },
  { month: "Aug", tasks: 106 },
];

export const statusData = [
  { name: "Completed", value: 86, color: "var(--chart-3)" },
  { name: "In Progress", value: 18, color: "var(--chart-1)" },
  { name: "Pending", value: 24, color: "var(--chart-4)" },
];

export const activityFeed = [
  {
    id: 1,
    user: "Priya S.",
    initials: "PS",
    action: "approved the",
    target: "Q3 Release Gate",
    time: "2 min ago",
    tone: "emerald",
  },
  {
    id: 2,
    user: "Marcus T.",
    initials: "MT",
    action: "moved to",
    target: "In Progress",
    time: "18 min ago",
    tone: "sky",
  },
  {
    id: 3,
    user: "Aisha K.",
    initials: "AK",
    action: "commented on",
    target: "CRM Sync Matrix",
    time: "42 min ago",
    tone: "violet",
  },
  {
    id: 4,
    user: "Devon L.",
    initials: "DL",
    action: "created",
    target: "Invoice Export v2",
    time: "1 hr ago",
    tone: "amber",
  },
  {
    id: 5,
    user: "Priya S.",
    initials: "PS",
    action: "flagged",
    target: "Data Migration",
    time: "3 hrs ago",
    tone: "rose",
  },
];

export const recentTasks = [
  { id: "T-1042", title: "Finalize Q3 release list", status: "In Progress", priority: "High", due: "Aug 28" },
  { id: "T-1039", title: "CRM sync validation", status: "Pending", priority: "Medium", due: "Aug 30" },
  { id: "T-1035", title: "Invoice export v2", status: "In Progress", priority: "High", due: "Sep 02" },
  { id: "T-1028", title: "User permission audit", status: "Completed", priority: "Low", due: "Aug 20" },
  { id: "T-1021", title: "Data migration dry-run", status: "Completed", priority: "Medium", due: "Aug 18" },
];

export const boardColumns = [
  {
    title: "Backlog",
    tone: "muted",
    tasks: [
      { id: "T-1043", title: "OAuth2 token refresh", tag: "Auth" },
      { id: "T-1041", title: "Notification center", tag: "UX" },
    ],
  },
  {
    title: "In Progress",
    tone: "sky",
    tasks: [
      { id: "T-1042", title: "Finalize Q3 release list", tag: "Release" },
      { id: "T-1035", title: "Invoice export v2", tag: "Billing" },
    ],
  },
  {
    title: "Review",
    tone: "violet",
    tasks: [
      { id: "T-1038", title: "Design tokens audit", tag: "Design" },
    ],
  },
  {
    title: "Done",
    tone: "emerald",
    tasks: [
      { id: "T-1028", title: "User permission audit", tag: "Security" },
      { id: "T-1021", title: "Data migration dry-run", tag: "Data" },
      { id: "T-1015", title: "Login page polish", tag: "UX" },
    ],
  },
];

export const matrixLists = [
  { id: "L-01", name: "Product Matrix — Core", owner: "Abhishake Jutur", items: 42, updated: "2 hrs ago" },
  { id: "L-02", name: "Release Gate Checklist", owner: "Priya S.", items: 18, updated: "1 day ago" },
  { id: "L-03", name: "Data Migration Matrix", owner: "Devon L.", items: 27, updated: "3 days ago" },
  { id: "L-04", name: "Security Review Matrix", owner: "Aisha K.", items: 15, updated: "4 days ago" },
  { id: "L-05", name: "Billing Integration Matrix", owner: "Marcus T.", items: 33, updated: "1 week ago" },
];
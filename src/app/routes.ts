export const ROUTES = {
  login: '/login',
  dashboard: '/',
  schedule: '/schedule',
  tasks: '/tasks',
  task: (id: string) => `/tasks/${id}`,
  friends: '/friends',
  chat: (id: string) => `/friends/${id}/chat`,
  matching: '/matching',
  forum: '/forum',
  post: (id: string) => `/forum/${id}`,
  map: '/map',
  settings: '/settings',
} as const;

export const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: '首页', icon: 'home' },
  { to: ROUTES.schedule, label: '课表', icon: 'calendar' },
  { to: ROUTES.tasks, label: '待办', icon: 'tasks' },
  { to: ROUTES.friends, label: '好友', icon: 'users' },
  { to: ROUTES.matching, label: '校园匹配', icon: 'sparkles' },
  { to: ROUTES.forum, label: '校园论坛', icon: 'forum' },
  { to: ROUTES.map, label: '校园地图', icon: 'map' },
  { to: ROUTES.settings, label: '设置', icon: 'settings' },
] as const;

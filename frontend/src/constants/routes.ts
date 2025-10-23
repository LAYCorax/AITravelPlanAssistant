// Route paths
export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  PLANNER: '/planner',
  PLANS: {
    LIST: '/plans',
    DETAIL: (id: string) => `/plans/${id}`,
  },
  SETTINGS: '/settings',
} as const;

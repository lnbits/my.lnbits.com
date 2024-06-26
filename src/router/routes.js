const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("pages/Nip05.vue") },
      { path: "/nip05", component: () => import("pages/Nip05.vue") },
      { path: "/activity", component: () => import("pages/Activity.vue") },

      // Not completed yet
      // {path: '/Taskboard', component: () => import('pages/TaskBoard.vue')},
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/Error404.vue"),
  },
  {
    path: "/pricing",
    component: () => import("pages/Pricing.vue"),
  },
  {
    path: "/login",
    component: () => import("pages/Login.vue"),
  },
];

export default routes;

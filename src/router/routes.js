const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { name: "Index", path: "", component: () => import("pages/Index.vue") },
      {
        name: "Login",
        path: "/login",
        component: () => import("pages/Login.vue"),
      },
      {
        name: "Profile",
        path: "/identities",
        component: () => import("src/pages/Indentities.vue"),
      },
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
];

export default routes;

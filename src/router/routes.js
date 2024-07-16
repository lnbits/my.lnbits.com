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
        name: "Account",
        path: "/account",
        component: () => import("pages/Account.vue"),
      },
      {
        name: "Identities",
        path: "/identities",
        component: () => import("pages/Indentities.vue"),
      },
      {
        name: "Profile",
        path: "/identities/:name",
        component: () => import("pages/Profile.vue"),
        props: true,
      },
      {
        name: "Pubkey",
        path: "/pubkey/:pubkey",
        component: () => import("pages/IdentifiersByPubkey.vue"),
        props: true,
      },
      {
        name: "Cart",
        path: "/cart",
        component: () => import("pages/Cart.vue"),
        props: true,
      }
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
];

export default routes;

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {path: '', component: () => import('pages/Instances.vue')},
      {
        path: '/instances',
        component: () => import('pages/Instances.vue'),
        props: route => ({plan: route.query.plan})
      },
      {path: '/activity', component: () => import('pages/Activity.vue')},
      {path: '/subscriptions', component: () => import('pages/Subscriptions.vue')},
      {path: '/payments', component: () => import('pages/Payments.vue')},

      // Not completed yet
      // {path: '/Taskboard', component: () => import('pages/TaskBoard.vue')},
    ]
  },

  {
    path: '/pricing',
    component: () => import('pages/Pricing.vue')
  },
  {
    path: '/terms-of-service',
    component: () => import('pages/TermsOfService.vue')
  },
  {
    path: '/login',
    component: () => import('pages/Login.vue')
  },
  {
    path: '/forgot-password',
    component: () => import('pages/ForgotPassword.vue')
  },
  {
    path: '/payment-confirmation',
    component: () => import('pages/PaymentConfirmation.vue')
  },
  {
    path: '/confirm',
    component: () => import('pages/Confirmation.vue')
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes

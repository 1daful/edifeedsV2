const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') }
    ]
  },

  { path: '/book', component: () => import('pages/book.vue') },
  { path: '/content', component: () => import('pages/Content.vue') },
  { path: '/login', component: () => import('pages/Login.vue') },
  { path: '/about', component: () => import('pages/About.vue') },
  { path: '/contact', component: () => import('pages/ContactUs.vue') },
  { path: '/terms', component: () => import('pages/TermsOfService.vue') },


  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes

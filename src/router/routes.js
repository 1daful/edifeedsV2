const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('src/pages/HomePage.vue') },
      { path: '/book/:id', name: 'book', component: () => import('pages/Book.vue') },
      { path: '/video/:id', name: 'video', component: () => import('pages/Video.vue') },
      { path: '/audio/:id', name: 'audio', component: () => import('pages/Audio.vue') },
      { path: '/quote/:id', name: 'quote', component: () => import('pages/Quote.vue') },
      { path: '/create-content', name: 'create', component: () => import('pages/CreatePage.vue') },
      { path: '/content', name: 'content', component: () => import('pages/Content.vue') },
      { path: '/search', name: 'search', component: () => import('pages/SearchPage.vue') },
      { path: '/events', name: 'events', component: () => import('pages/Events.vue') },
      { path: '/settings', name: 'settings', component: () => import('pages/SettingPage.vue') },
      { path: '/user-profile', name: 'userProfile', component: () => import('pages/UserProfile.vue') },
      { path: '/content-preview/:id', name: 'content-preview', component: () => import('pages/ContentPreview.vue') },
      { path: '/collection/:id', name: 'collection', component: () => import('pages/CollectionDetail.vue') },
      { path: '/author/:id', name: 'author', component: () => import('pages/AuthorPage.vue') },
      { path: '/auth', name: 'auth', component: () => import('pages/Auth.vue') },
      { path: '/about', name: 'about', component: () => import('pages/About.vue') },
      { path: '/contact', name: 'contact', component: () => import('pages/ContactUs.vue') },
      { path: '/terms', name: 'terms', component: () => import('pages/TermsOfService.vue') },
      { path: '/home', name: 'home', component: () => import('pages/HomePage10.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes

import { dbClient } from 'src/api/apiList'
import { supabase } from 'src/lib/supabase'
const authGuard = async (to, from, next) => {
  const userId = (await supabase.auth.getUser()).data.user?.id
  let user
  if (userId) {
    user = await dbClient.get({
      url: 'dating_profiles',
      params: {
        filters: [
          {
            col: 'id',
          op: 'eq',
          val: userId,
        },
      ],
    },
  })
}

else {
  next({name: 'auth'})
}
  if (!user) {
    next({ name: 'onboard' })
  } else {
    next()
  }
}

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
      { path: '/create', name: 'content-create', component: () => import('pages/Create.vue') },
      {
        path: '/onboard',
        name: 'onboard',
        component: () => import('src/pages/community/EdifeedsLove/Onboard.vue'),
      },
      {
        path: 'community',
        component: () => import('layouts/MainLayout.vue'),
        children: [
          {
            path: '/edifeeds-love',
            name: 'edifeeds-love',
            component: () => import('src/layouts/EdifeedsLoveLayout.vue'),
            children: [
              {
                path: '',
                name: 'edifeeds-love-index',
                component: () => import('src/pages/community/EdifeedsLove/IndexPage.vue'),
                beforeEnter: authGuard,
              },
              {
                path: 'onboard',
                component: () => import('src/pages/community/EdifeedsLove/Onboard.vue'),
              },
              {
                name: 'edifeeds-love-chat',
                path: 'chat/:matchId',
                component: () => import('src/pages/community/EdifeedsLove/ChatPage.vue'),
                beforeEnter: authGuard,
              },
              {
                name: 'edifeeds-love-user',
                path: ':userId',
                component: () => import('src/pages/community/EdifeedsLove/ProfilePage.vue'),
                beforeEnter: authGuard,
              },
              {
                name: 'edifeeds-love-profile',
                path: 'visit/:otherUser',
                component: () => import('src/pages/community/EdifeedsLove/OtherProfilePage.vue'),
                beforeEnter: authGuard,
              },
            ],
          },
          { path: 'unity-hub', component: () => import('pages/community/UnityHub.vue') },
          { path: 'prayer-wall', component: () => import('pages/community/PrayerWall.vue') },
          { path: 'groups', component: () => import('pages/community/Groups.vue') },
        ],
      },
      { path: '/content', name: 'content', component: () => import('pages/Content.vue') },
      { path: '/media', name: 'media', component: () => import('src/pages/MediaPage.vue') },
      { path: '/search', name: 'search', component: () => import('pages/SearchPage.vue') },
      { path: '/events', name: 'events', component: () => import('pages/Events.vue') },
      { path: '/settings', name: 'settings', component: () => import('pages/SettingPage.vue') },
      { path: '/profile', name: 'userProfile', component: () => import('pages/UserProfile.vue') },
      {
        path: '/user-preference',
        name: 'userPreference',
        component: () => import('pages/UserPreference.vue'),
      },
      {
        path: '/content-preview/:id',
        name: 'content-preview',
        component: () => import('pages/ContentPreview.vue'),
      },
      {
        path: '/challenges',
        name: 'challenges',
        component: () => import('pages/challenge/ChallengeList.vue'),
      },
      {
        path: '/collection/:id',
        name: 'collection',
        component: () => import('pages/CollectionDetail.vue'),
      },
      { path: '/author/:id', name: 'author', component: () => import('pages/AuthorPage.vue') },
      { path: '/auth', name: 'auth', component: () => import('pages/Auth.vue') },
      { path: '/about', name: 'about', component: () => import('pages/About.vue') },
      { path: '/contact', name: 'contact', component: () => import('pages/ContactUs.vue') },
      { path: '/terms', name: 'terms', component: () => import('pages/TermsOfService.vue') },
      { path: '/home', name: 'home', component: () => import('src/pages/HomePage0.vue') },
      { path: '/home1', name: 'home1', component: () => import('pages/HomePage1.vue') },
      { path: '/home2', name: 'home2', component: () => import('pages/HomePage2.vue') },
      { path: '/home3', name: 'home3', component: () => import('pages/HomePage3.vue') },
      { path: '/home4', name: 'home4', component: () => import('pages/HomePage4.vue') },
    ],
  },
  {
    path: '/admin',
    component: () => import('layouts/AdminLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/admin/AdminDashboard.vue'),
      },
      {
        path: 'topics',
        component: () => import('pages/admin/TopicManagerPage.vue'),
      },
      {
        path: 'topics/:id/:slug',
        name: 'topic',
        component: () => import('pages/admin/TopicDetail.vue'),
      },
      {
        component: () => import('src/pages/admin/CreateGroup.vue'),
        path: 'create-group',
        name: 'create-group',
      },
    ],
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    name: 'auth',
    path: '/login',
    component: () => import('pages/Auth.vue'),
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes

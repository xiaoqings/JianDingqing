export default [
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', name: 'login', component: './User/Login' },
      { path: '/user/register', name: 'register', component: './User/Register' },
      { path: '/user/reset-password', name: 'reset.password', component: './User/ResetPassword' },
    ],
  },

  // app
  {
    path: '/',
    component: '../layouts/BasicLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['admin', 'user'],
    routes: [
      { path: '/', redirect: '/dashboard' },
      {
        path: '/dashboard',
        name: '系统首页',
        icon: 'home',
        component: './Dashboard/Analysis',
        authority: ['admin'],
      },
      {
        path: '/dashboards',
        name: '系统首页',
        icon: 'home',
        component: './Dashboard/UserAnalysis',
        authority: ['user'],
      },
      {
        name: '商家管理',
        icon: 'table',
        authority: ['admin'],
        path: '/merchants/merchants',
        component: './Merchants/Merchants'
      },
      {
        path: '/account/shopping',
        name: '购物点管理',
        icon: 'bars',
        component: './Account/Center/Shopping',
      },
      {
        path: '/account/settings',
        name: '个人中心',
        icon: 'user',
        component: './Account/Settings/Info',
        routes: [
          {
            path: '/account/settings',
            redirect: '/account/settings/center',
          },
          {
            path: '/account/settings/center',
            component: './Account/Center/Center',
          },
          {
            path: '/account/settings/base',
            component: './Account/Settings/BaseView',
          },
          {
            path: '/account/settings/security',
            component: './Account/Settings/SecurityView',
          },
          {
            path: '/account/settings/binding',
            component: './Account/Settings/BindingView',
          },
          {
            path: '/account/settings/notification',
            component: './Account/Settings/NotificationView',
          },
        ],
      },
      {
        path: '/account/logs',
        name: '登录日志',
        icon: 'profile',
        component: './Account/Logs/List',
        authority: ['admin'],
      },
      {
        component: '404',
      },
    ],
  },
];

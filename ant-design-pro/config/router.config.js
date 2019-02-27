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
      },
      {
        // path: '/merchants',
        name: '商家管理',
        icon: 'table',
        authority: ['admin'],
        path: '/merchants/merchants',
        component: './Merchants/Merchants',
        // routes: [
        //   {
        //     name: '商家入驻',
        //     path: '/merchants/merchant',
        //     component: './Merchants/Merchant',
        //   },
        //   {
        //     name: '商家列表',
        //     path: '/merchants/merchants',
        //     component: './Merchants/Merchants',
        //   },
        // ],
      },
      {
        path: '/account/center',
        name: '个人中心',
        icon: 'user',
        component: './Account/Center/Center',
        routes: [
          {
            path: '/account/center',
            redirect: '/account/center/articles',
          },
          {
            path: '/account/center/articles',
            component: './Account/Center/Articles',
          },
          {
            path: '/account/center/applications',
            component: './Account/Center/Applications',
          },
          {
            path: '/account/center/projects',
            component: './Account/Center/Projects',
          },
        ],
      },
      {
        path: '/account/settings',
        name: '个人设置',
        icon: 'setting',
        component: './Account/Settings/Info',
        routes: [
          {
            path: '/account/settings',
            redirect: '/account/settings/base',
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
        icon: 'bars',
        component: './Account/Logs/List',
        authority: ['admin'],
      },
      {
        component: '404',
      },
    ],
  },
];

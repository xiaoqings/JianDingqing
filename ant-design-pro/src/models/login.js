import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { fakeAccountLogin, getFakeCaptcha } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';
import {requestFetch} from '../utils/request';
import { message } from 'antd';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      let response = yield requestFetch('/lr/login', { method: 'POST', body: payload });
      if (!(response && response.status === 200)) {
        return message.error(response.message);
      }
      let {
        businessCode,
        businessPhone,
        businessName,
        businessType = 'user',
        businessContact,
        headerPicPath,
      } = response.data;

      let result = {
        userid: businessCode,
        phone: businessPhone || null,
        type: businessType,
        name: businessName || ((businessType === 'user') ? 'User - 商户' : 'Admin - 管理员'),
        contact: businessContact || null,
        avatar: headerPicPath || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        email: null,
        address: null,
      };

      yield put({
        type: 'changeLoginStatus',
        payload: {
          user: result,
          currentAuthority: businessType,
          status: true,
        },
      });

      // Login Success
      reloadAuthorized();
      if (!businessName || !businessContact) {
        yield put(routerRedux.replace('/account/settings'));
      } else {
        console.log(businessType);
        if(businessType == 'admin'){
          yield put(routerRedux.replace('/'));
        }else {
          yield put(routerRedux.replace('/dashboards'));
        }
      }
    },

    *logout(_, { put }) {
      let response = yield requestFetch('/lr/loginOut');

      yield put({
        type: 'changeLoginStatus',
        payload: {
          user: null,
          status: false,
          currentAuthority: 'guest',
        },
      });
      reloadAuthorized();
      yield put(
        routerRedux.push({
          pathname: '/user/login',
          search: stringify({
            redirect: window.location.href,
          }),
        })
      );
    },

    // todo 修改密码
    *updatePassword({payload}, { put }) {
      let response = yield requestFetch('/lr/up', { method: 'POST', body: payload });
      if (!(response && response.status === 200)) {
        return message.error(response.message);
      }
      message.success('密码修改成功,请重新登录!');
      yield put({
        type: 'changeLoginStatus',
        payload: {
          user: null,
          status: false,
          currentAuthority: 'guest',
        },
      });
      reloadAuthorized();
      yield put(
        routerRedux.push({
          pathname: '/user/login',
          search: stringify({ redirect: window.location.href}),
        })
      );
    },

    // todo 发送短信验证码
    *getCaptcha({ payload }, { call }) {
      payload = { businessPhone: payload.mobile };
      console.log(payload);
      let response = yield requestFetch('/lr/forgetPassSendSms', { method: 'POST', body: payload });
      console.log(response);
      if (!(response && response.status === 200)) {
        return message.error(response.message || '验证码发送失败!');
      }
      message.success('验证码已发送,请注意查收!');
      console.log(response);
    },

    // todo 忘记密码
    *resetPassword({payload}, { put }) {
      console.log(payload);
      let params = {
        businessPhone: payload.mobile,
        code : payload.captcha,
        businessPassword : payload.password,
        confirmPassword : payload.confirmPassword,
      };
      let response = yield requestFetch('/lr/forgetPassword', { method: 'POST', body: params });
      if (!(response && response.status === 200)) {
        return message.error(response.message);
      }
      message.success('密码密码重置,请登录!');
      yield put(
        routerRedux.push({
          pathname: '/user/login',
          search: stringify({ redirect: window.location.href}),
        })
      );
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      window.localStorage.setItem('currUser', JSON.stringify(payload.user));
      return {
        ...state,
        status: payload.status,
      };
    },
  },
};

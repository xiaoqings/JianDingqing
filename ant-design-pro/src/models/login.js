import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { fakeAccountLogin, getFakeCaptcha } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { getPageQuery } from '@/utils/utils';
import { reloadAuthorized } from '@/utils/Authorized';
import request from '../utils/request';
import { message } from 'antd';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      let response = yield request('/api/lr/login', { method: 'POST', body: payload });
      if (!(response && response.status === 200)) {
        return message.error(response.message);
      }
      console.log(response);

      let {
        businessCode,
        businessPhone,
        businessName,
        businessType,
        businessContact,
      } = response.data;

      let result = {
        userid: businessCode,
        phone: businessPhone || null,
        type: businessType,
        name: businessName || 'User - 商户',
        contact: businessContact || null,
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        email: '',
        address: '',
      };

      yield put({
        type: 'changeLoginStatus',
        payload: {
          user: result,
          currentAuthority: businessType,
          status: true,
        },
      });
      reloadAuthorized();

      if (!businessName || !businessContact) {
        yield put(routerRedux.replace('/account/settings'));
      } else {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;
        if (redirect) {
          const redirectUrlParams = new URL(redirect);
          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);
            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }
        yield put(routerRedux.replace(redirect || '/'));
      }
    },

    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },

    *logout(_, { put }) {
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

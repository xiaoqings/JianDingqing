import { fakeRegister } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import {requestFetch} from '../../../utils/request';
import { message } from 'antd';
import * as routerRedux from 'react-router-redux';

export default {
  namespace: 'register',

  state: {
    status: undefined,
  },

  effects: {
    // todo 用户注册
    *submit({ payload }, { call, put }) {
      console.log(payload);
      payload = {
        confirmPassword: payload.confirmPassword,
        businessPassword: payload.password,
        businessPhone: payload.mobile,
        code: payload.captcha,
      };
      const response = yield requestFetch('/lr/register', { method: 'POST', body: payload });
      if (!(response && response.status === 200)) {
        return message.error(response.message || '注册失败!');
      }
      console.log(response);
      message.success('注册成功!');
      yield put(routerRedux.replace('/#/User/Login'));
    },

    // todo 发送短信验证码
    *send({ payload }, { call, put }) {
      payload = { businessPhone: payload.mobile };
      console.log(payload);
      let response = yield requestFetch('/lr/sendSms', { method: 'POST', body: payload });
      console.log(response);
      if (!(response && response.status === 200)) {
        return message.error(response.message || '验证码发送失败!');
      }
      message.success('验证码已发送,请注意查收!');
      console.log(response);
    },
  },

  reducers: {
    registerHandle(state, { payload }) {
      setAuthority('user');
      reloadAuthorized();
      return {
        ...state,
        status: payload.status,
      };
    },
  },
};

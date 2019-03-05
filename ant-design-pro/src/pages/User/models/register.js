import { fakeRegister } from '@/services/api';
import { setAuthority } from '@/utils/authority';
import { reloadAuthorized } from '@/utils/Authorized';
import request from '../../../utils/request';
import { message } from 'antd';

export default {
  namespace: 'register',

  state: {
    status: undefined,
  },

  effects: {
    *submit({ payload }, { call, put }) {
      console.log(payload);
      payload = {
        confirmPassword : payload.confirmPassword,
        businessPassword : payload.password,
        businessPhone : payload.mobile,
        code : payload.captcha
      };
      const response = yield call(fakeRegister, payload);
      yield put({
        type: 'registerHandle',
        payload: response,
      });
    },
    *send({ payload }, { call, put }) {
      payload = { businessPhone : payload.mobile};
      console.log(payload);
      let response =  yield request('/api/lr/sendSms', { method: 'POST', body: payload});
      console.log(response);
      if(!(response && response.status === 200)){
        return message.error(response.message);
      }

      yield put({
        // type: 'registerHandle',
        // payload: response,
      });
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

/* eslint-disable no-unused-vars */
import { queryFakeList, removeFakeList, addFakeList, updateFakeList } from '@/services/api';
import { requestFetch } from '../utils/request';
import { message } from 'antd';

export default {
  namespace: 'list',
  state: {
    list: [],
  },
  reducers: {
    queryList(state, { payload }) {
      return {
        list: payload.data || [],
        page: payload.page,
      };
    }
  },
  effects: {
    // todo 查询用户登录日志
    *fetchBusinessList({ payload }, { call, put }) {
      const response = yield requestFetch('/detail/list', { method: 'POST', body: payload });
      if (!(response && response.status === 200)) {
        return message.error(response.message);
      }
      yield put({
        type: 'queryList',
        payload: response,
      });
    },

    // todo 查询用户登录日志
    *fetchLog({ payload }, { call, put }) {
      const response = yield requestFetch('/record/list', { method: 'POST', body: payload });
      if (!(response && response.status === 200)) {
        return message.error(response.message);
      }
      yield put({ type: 'queryList', payload: response});
    },

    // todo 查询用户登录日志
    *queryList({ payload }, { call, put }) {
      const response = yield requestFetch('/customer/find', { method: 'POST', body: payload });
      if (!(response && response.status === 200)) {
        return message.error(response.message);
      }
      console.log(response);
      yield put({ type: 'queryList', payload: response});
    },
  },
};

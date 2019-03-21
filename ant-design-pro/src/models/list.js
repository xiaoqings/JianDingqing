import { queryFakeList, removeFakeList, addFakeList, updateFakeList } from '@/services/api';
import request from '../utils/request';
import { message } from 'antd';

export default {
  namespace: 'list',

  state: {
    list: [],
  },

  effects: {
    // todo 查询用户登录日志
    *fetchBusinessList({ payload }, { call, put }) {
      let response = yield request('/api/detail/list', { method: 'POST', body: payload });
      console.log(response);
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
      let response = yield request('/api/record/list', { method: 'POST', body: payload });
      console.log(response);
      if (!(response && response.status === 200)) {
        return message.error(response.message);
      }
      yield put({
        type: 'queryList',
        payload: response,
      });
    },
  },

  reducers: {
    queryList(state, { payload }) {
      return {
        ...state,
        list: payload.data,
        page: payload.page,
      };
    },
    appendList(state, action) {
      return {
        ...state,
        list: state.list.concat(action.payload),
      };
    },
  },
};

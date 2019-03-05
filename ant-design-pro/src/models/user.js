import { query as queryUsers, queryCurrent } from '@/services/user';
import * as routerRedux from 'react-router-redux';

export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
  },

  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    // todo 查询当前登录用户信息
    *fetchCurrent(_, { call, put }) {
      let res = JSON.parse(window.localStorage.getItem('currUser'));
      console.log('currUser ==> ', res);
      if (res === null) {
        yield put(routerRedux.replace('/user/login'));
      }
      yield put({
        type: 'saveCurrentUser',
        payload: res,
      });
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        list: action.payload,
      };
    },
    saveCurrentUser(state, { payload }) {
      return {
        ...state,
        currentUser: payload || {},
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};

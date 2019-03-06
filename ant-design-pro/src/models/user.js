import { query as queryUsers, queryCurrent } from '@/services/user';
import * as routerRedux from 'react-router-redux';
import request from '../utils/request';
import { message } from 'antd';


export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
  },

  effects: {
    *fetch({payload}, { call, put }) {
      const response = yield call(queryUsers);
      yield put({
        type: 'save',
        payload: response,
      });
    },

    // todo 查询当前登录用户信息
    *fetchCurrent({}, { call, put }) {
      let res = JSON.parse(window.localStorage.getItem('currUser'));
      if (res === null) {
        yield put(routerRedux.replace('/user/login'));
      }
      yield put({
        type: 'saveCurrentUser',
        payload: res,
      });
      let response = yield request(`/api/detail/bycode/${res.userid}`);
      console.log(response);
      if (response && response.status === 200) {
        const { businessAddress, businessContact, businessName, businessPhone, headerPicPath} = response.data;
        res.phone = businessPhone || res.phone;
        res.name = businessName || res.name;
        res.contact = businessContact || res.contact;
        res.address = businessAddress || res.address;
        res.avatar = headerPicPath || res.avatar;
        window.localStorage.setItem('currUser', JSON.stringify(res));
      }
    },

    // todo 修改用户头像
    *updateAvatar({payload}, { call, put }) {
      let response = yield request('/api/lr/upload', { method: 'POST', body: payload });
      if (!(response && response.status === 200)) {
        return message.error(response.message || '头像设置失败!');
      }
      let res = JSON.parse(window.localStorage.getItem('currUser'));
      res.avatar = payload.filePath;
      window.localStorage.setItem('currUser', JSON.stringify(res));

      message.success('头像设置成功!');
      yield put({
        type: 'saveCurrentUser',
        payload: res,
      });
    },

    // todo 修改用户信息
    *updateUserInfo({payload}, { call, put }) {
      const {name,address,contact,phone} = payload;
      let res = JSON.parse(window.localStorage.getItem('currUser'));
      let params = {
        businessCode : res.userid,
        businessAddress : address,
        businessContact : contact,
        businessName : name,
        businessPhone : phone
      };
      let response = yield request('/api/detail/create', { method: 'POST', body: params });
      if (!(response && response.status === 200)) {
        return message.error(response.message || '信息修改失败!');
      }
      res.phone = phone;
      res.name = name;
      res.contact = contact;
      res.address = address;
      window.localStorage.setItem('currUser', JSON.stringify(res));

      message.success('信息修改成功!');
      yield put({
        type: 'saveCurrentUser',
        payload: res,
      });
    },
    // todo 充值购物点数
    *addShopping({payload}, { call, put }) {
      let response = yield request('/api/ssr/create', { method: 'POST', body: payload });
      console.log(response);
      if (!(response && response.status === 200)) {
        return message.error(response.message || '购物点数充值失败!');
      }
      message.success(`${payload.customerPhone} 用户, 成功充值 ${payload.money} 购物点数!`);
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
    }
  },
};

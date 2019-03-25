import { queryCurrent } from '@/services/user';
import * as routerRedux from 'react-router-redux';
import request from '../utils/request';
import { message } from 'antd';
import { setAuthority } from '../utils/authority';
import { stringify } from 'qs';
import { reloadAuthorized } from '../utils/Authorized';


export default {
  namespace: 'user',

  state: {
    list: [],
    currentUser: {},
  },

  effects: {
    // todo 查询商家未核销购物点
    *fetch({payload}, { call, put }) {
      let response = yield request('/api/ssc/list', { method: 'POST', body: payload });
      if (!(response && response.status === 200)) {
        return message.error(response.message || '数据查询失败!');
      }
      yield put({
        type: 'save',
        payload: response,
      });
    },

    // todo 查询商家未核销购物点
    *fetchList({payload}, { call, put }) {
      let response = yield request('/api/ssc/list', { method: 'POST', body: payload });
      if (!(response && response.status === 200)) {
        return message.error(response.message || '数据查询失败!');
      }
      yield put({
        type: 'save',
        payload: response,
      });
    },

    // todo 查询首页信息
    *fetchHome({payload}, { call, put }) {
      let response = yield request('/api/index/data',{ method: 'POST', body: payload });
      console.log(response);
      if (!(response && response.status === 200)) {
        return message.error(response.message || '数据查询失败!');
      }
      yield put({
        type: 'save',
        payload: response,
      });
    },

    // todo 核销记录
    *alreadyWriteoff({payload}, { call, put }) {
      let response = yield request('/api/ssc/alreadyWriteoff',{ method: 'POST', body: payload });
      console.log(response);
      if (!(response && response.status === 200)) {
        return message.error(response.message || '数据查询失败!');
      }
      yield put({
        type: 'save',
        payload: response,
      });
    },

    // todo 未核销的购物点数
    *sscByCondition({payload}, { call, put }) {
      let response = yield request('/api/ssc/sscByCondition',{ method: 'POST', body: payload });
      console.log(response);
      if (!(response && response.status === 200)) {
        return message.error(response.message || '数据查询失败!');
      }
      yield put({
        type: 'save',
        payload: response,
      });
    },

    // todo 查询当前登录用户信息
    *fetchCurrent({}, { call, put }) {
      let res = JSON.parse(window.localStorage.getItem('currUser'));
      console.log('0000000000000000000000000 =====> ',res);
      if (res === null) {
        // yield put(routerRedux.replace('/user/login'));
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
      }else {
        yield put({
          type: 'saveCurrentUser',
          payload: res,
        });
        let response = yield request(`/api/detail/bycode/${res.userid}`);
        if (response && response.status === 200) {
          const { businessAddress, businessContact, businessName, businessPhone, headerPicPath} = response.data;
          res.phone = businessPhone || res.phone;
          res.name = businessName || res.name;
          res.contact = businessContact || res.contact;
          res.address = businessAddress || res.address;
          res.avatar = headerPicPath || res.avatar;
          window.localStorage.setItem('currUser', JSON.stringify(res));
        }
      }
    },

    // todo 修改用户头像
    *updateAvatar({payload}, { call, put }) {
      console.log('lr/upload ==> ',{...payload});
      let response = yield request('/api/lr/upload', { method: 'POST', body: payload});
      console.log(response);

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
      let response = yield request('/api/detail/updateDetail', { method: 'POST', body: params });
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
      console.log(payload);
      const {type} = payload;
      if(type === 1){
        console.log('充值购物点数',type);
        let response = yield request('/api/ssr/create', { method: 'POST', body: payload });
        if (!(response && response.status === 200)) {
          return message.error(response.message || '购物点数充值失败!');
        }
        message.success(`${payload.customerPhone} 用户, 成功充值 ${payload.money} 购物点数!`);
      }else {
        payload.consumptionShoppingSpot = payload.money;
        let response = yield request('/api/ssc/create', { method: 'POST', body: payload });
        if (!(response && response.status === 200)) {
          return message.error(response.message || '购物点数兑换失败!');
        }
        message.success(`${payload.customerPhone} 用户, 你已成功兑换 ${payload.money} 购物点数!`);
      }
    },

    // todo 保存设置核销时间
    *saveSetting({payload}, { call, put }) {
      let response = yield request('/api/detail/setWOTime', { method: 'POST', body: payload });
      console.log(response);
      if (!(response && response.status === 200)) {
        return message.error(response.message || '数据提交失败!');
      }
      message.success(`提交成功!`);
    },

    // todo 核销购物点
    *HeXiaoShpping({payload}, { call, put }) {
      let response = yield ('/api/detail/writeOff', { method: 'POST', body: payload });
      console.log(response);
      if (!(response && response.status === 200)) {
        return message.error(response.message || '数据核销失败!');
      }
      message.success(`提交成功!`);
    },

  },

  reducers: {
    save(state, {payload}) {
      return {
        ...state,
        list: payload.data || [],
        page: payload.page || null
      };
    },
    changeLoginStatus(state, { payload }) {
      console.log('currUser ========> ',payload);
      setAuthority(payload.currentAuthority);
      window.localStorage.setItem('currUser', JSON.stringify(payload.user));
      return {
        ...state,
        status: payload.status,
      };
    },
    saveCurrentUser(state, { payload }) {
      return {
        ...state,
        currentUser: payload || {},
      };
    },
  },
};

import React, { Component } from 'react';
import { connect } from 'dva';
import { Checkbox, Alert } from 'antd';
import Login from '@/components/Login';
import styles from './Login.less';
import Link from 'umi/link';

const { UserName, Password, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class LoginPage extends Component {
  state = {
    type: 'account',
    autoLogin: true,
  };

  onTabChange = type => {
    this.setState({ type });
  };

  onGetCaptcha = () =>
    new Promise((resolve, reject) => {
      this.loginForm.validateFields(['mobile'], {}, (err, values) => {
        if (err) {
          reject(err);
        } else {
          const { dispatch } = this.props;
          dispatch({
            type: 'login/getCaptcha',
            payload: values.mobile,
          })
            .then(resolve)
            .catch(reject);
        }
      });
    });

  handleSubmit = (err, values) => {
    const { type } = this.state;
    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: 'login/login',
        payload: {
          ...values,
          type,
        },
      });
    }
  };

  changeAutoLogin = e => {
    this.setState({
      autoLogin: e.target.checked,
    });
  };

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render() {
    const { login, submitting } = this.props;
    const { type, autoLogin } = this.state;
    return (
      <div className={styles.main}>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          {login.status === 'error' &&
            login.type === 'account' &&
            !submitting &&
            this.renderMessage('账户或密码错误（admin/123456)')}
          <UserName
            name="userName"
            placeholder={`用户名 : admin or user`}
            rules={[
              {
                required: true,
                message: '请输入用户名',
              },
            ]}
          />
          <Password
            name="password"
            placeholder={`密码 : 123456`}
            rules={[
              {
                required: true,
                message: '请输入密码',
              },
            ]}
            onPressEnter={e => {
              e.preventDefault();
              this.loginForm.validateFields(this.handleSubmit);
            }}
          />
          <div>
            <Checkbox checked={autoLogin} onChange={this.changeAutoLogin}>
              {'自动登录'}
            </Checkbox>
            <Link style={{ float: 'right' }} to="/user/reset-password">
              {'忘记密码?'}
            </Link>
            <Link style={{ float: 'right', marginRight: '20px' }} to="/user/register">
              {'商家入驻'}
            </Link>
          </div>
          <Submit loading={submitting}>{'登录'}</Submit>
        </Login>
      </div>
    );
  }
}

export default LoginPage;

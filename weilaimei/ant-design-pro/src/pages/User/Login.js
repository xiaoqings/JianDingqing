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
    autoLogin: true,
  };

  handleSubmit = (err, values) => {
    if (!err) {
      const { dispatch } = this.props;
      dispatch({
        type: 'login/login',
        payload: { ...values},
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
    const { autoLogin } = this.state;
    return (
      <div className={styles.main}>
        <Login
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          {login .status === 'error' &&  !submitting &&
          this.renderMessage('账户或密码错误')}
          <UserName
            name="businessPhone"
            placeholder={`手机号`}
            rules={[
              {
                required: true,
                message: '请输入用户名',
              },
            ]}
          />
          <Password
            name="businessPassword"
            placeholder={`密码`}
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

import React, { Component } from 'react';
import { connect } from 'dva';
import { Alert } from 'antd';
import Login from '@/components/Login';
import Link from 'umi/link';
import styles from './Login.less';

const { Password, Mobile, Captcha, Submit } = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
class ResetPassword extends Component {
  state = {
    type: 'account',
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

  renderMessage = content => (
    <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />
  );

  render() {
    const { login, submitting } = this.props;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <h3 style={{ textAlign: 'center', fontSize: '24px' }}>{'忘记密码'}</h3>
        <Login
          defaultActiveKey={type}
          onTabChange={this.onTabChange}
          onSubmit={this.handleSubmit}
          ref={form => {
            this.loginForm = form;
          }}
        >
          {login.status === 'error' &&
            login.type === 'mobile' &&
            !submitting &&
            this.renderMessage('验证码错误!')}
          <Mobile
            name="mobile"
            placeholder="手机号"
            rules={[
              {
                required: true,
                message: '请输入手机号',
              },
              {
                pattern: /^1\d{10}$/,
                message: '手机号输入不正确',
              },
            ]}
          />
          <Captcha
            name="captcha"
            placeholder="验证码"
            countDown={120}
            onGetCaptcha={this.onGetCaptcha}
            getCaptchaButtonText="获取验证码"
            getCaptchaSecondText="秒"
            rules={[
              {
                required: true,
                message: '请输入验证码',
              },
            ]}
          />
          <Password
            name="password"
            placeholder="密码"
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
          <Password
            name="rePassword"
            placeholder="确认密码"
            rules={[
              {
                required: true,
                message: '请输入确认密码',
              },
            ]}
            onPressEnter={e => {
              e.preventDefault();
              this.loginForm.validateFields(this.handleSubmit);
            }}
          />
          <div>
            <Link to="/User/Login">{' 返回登录 '}</Link>
          </div>
          <Submit loading={submitting}>重置密码</Submit>
        </Login>
      </div>
    );
  }
}

export default ResetPassword;

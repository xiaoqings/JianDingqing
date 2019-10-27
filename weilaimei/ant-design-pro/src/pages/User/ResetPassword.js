import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Col, Form, Input, message, Popover, Progress, Row } from 'antd';
import Link from 'umi/link';
import styles from './Login.less';

const FormItem = Form.Item;
const InputGroup = Input.Group;

const passwordStatusMap = {
  ok: <div className={styles.success}>{'强度：强'}</div>,
  pass: <div className={styles.warning}>{'强度：中'}</div>,
  poor: <div className={styles.error}>{'强度：太短'}</div>,
};

const passwordProgressMap = {
  ok: 'success',
  pass: 'normal',
  poor: 'exception',
};

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/resetPassword'],
}))
@Form.create()
class ResetPassword extends Component {
  state = {
    type: 'account',
  };

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  onGetCaptcha = () => {
    const { dispatch } = this.props;
    const { mobile } = this.state;
    if (!mobile) {
      return message.error('请输入手机号!');
    }

    dispatch({
      type: 'login/getCaptcha',
      payload: { mobile },
    });

    let count = 59;
    this.setState({ count });
    this.interval = setInterval(() => {
      count -= 1;
      this.setState({ count });
      if (count === 0) {
        clearInterval(this.interval);
      }
    }, 1000);
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        dispatch({
          type: 'login/resetPassword',
          payload: { ...values },
        });
      }
    });
  };

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('password');
    const passwordStatus = this.getPasswordStatus();
    return value && value.length ? (
      <div className={styles[`progress-${passwordStatus}`]}>
        <Progress
          status={passwordProgressMap[passwordStatus]}
          className={styles.progress}
          strokeWidth={6}
          percent={value.length * 10 > 100 ? 100 : value.length * 10}
          showInfo={false}
        />
      </div>
    ) : null;
  };

  checkPassword = (rule, value, callback) => {
    const { visible, confirmDirty } = this.state;
    if (!value) {
      this.setState({
        help: '请输入新密码!',
        visible: !!value,
      });
      callback('error');
    } else {
      this.setState({
        help: '',
      });
      if (!visible) {
        this.setState({
          visible: !!value,
        });
      }
      if (value.length < 6) {
        callback('error');
      } else {
        const { form } = this.props;
        if (value && confirmDirty) {
          form.validateFields(['confirm'], { force: true });
        }
        callback();
      }
    }
  };

  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不匹配!');
    } else {
      callback();
    }
  };

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    const { count, help, visible } = this.state;
    return (
      <div className={styles.main}>
        <h3 style={{ textAlign: 'center', fontSize: '24px' }}>{'忘记密码'}</h3>
        <Form onSubmit={this.handleSubmit}>
          <FormItem>
            <InputGroup compact>
              {getFieldDecorator('mobile', {
                rules: [
                  {
                    required: true,
                    message: '请输入手机号',
                  },
                  {
                    pattern: /^\d{11}$/,
                    message: '手机号格式错误',
                  },
                ],
              })(
                <Input
                  size="large"
                  onChange={e => this.setState({ mobile: e.target.value })}
                  placeholder={'手机号'}
                />
              )}
            </InputGroup>
          </FormItem>
          <FormItem>
            <Row gutter={8}>
              <Col span={16}>
                {getFieldDecorator('captcha', {
                  rules: [
                    {
                      required: true,
                      message: '请输入验证码',
                    },
                  ],
                })(<Input size="large" placeholder={'验证码'} />)}
              </Col>
              <Col span={8}>
                <Button
                  size="large"
                  disabled={count}
                  className={styles.getCaptcha}
                  onClick={this.onGetCaptcha}
                >
                  {count ? `${count} s` : '获取验证码'}
                </Button>
              </Col>
            </Row>
          </FormItem>
          <FormItem help={help}>
            <Popover
              getPopupContainer={node => node.parentNode}
              content={
                <div style={{ padding: '4px 0' }}>
                  {passwordStatusMap[this.getPasswordStatus()]}
                  {this.renderPasswordProgress()}
                  <div style={{ marginTop: 10 }}>
                    {'请至少输入 6 个字符。请不要使用容易被猜到的密码。'}
                  </div>
                </div>
              }
              overlayStyle={{ width: 240 }}
              placement="right"
              visible={visible}
            >
              {getFieldDecorator('password', {
                rules: [
                  {
                    validator: this.checkPassword,
                  },
                ],
              })(<Input size="large" type="password" placeholder={'请输入新密码 : 至少6位密码，区分大小写'} />)}
            </Popover>
          </FormItem>
          <FormItem>
            {getFieldDecorator('confirmPassword', {
              rules: [
                {
                  required: true,
                  message: '请确认密码',
                },
                {
                  validator: this.checkConfirm,
                },
              ],
            })(<Input size="large" type="password" placeholder={'确认密码'} />)}
          </FormItem>
          <FormItem>
            <Button
              size="large"
              loading={submitting}
              className={styles.submit}
              type="primary"
              htmlType="submit"
            >
              {submitting ? '密码重置中...' : '重置密码'}
            </Button>
            <Link className={styles.login} to="/User/Login">
              {'返回登录'}
            </Link>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default ResetPassword;

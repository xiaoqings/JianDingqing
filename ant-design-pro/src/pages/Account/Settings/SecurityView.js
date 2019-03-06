import React, { Component } from 'react';
import { connect } from 'dva';
import styles from '../../User/Register.less';
import { Form, Input, Button, Popover, Progress } from 'antd';

const FormItem = Form.Item;

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
  submitting: loading.effects['login/updatePassword'],
}))
@Form.create()

class SecurityView extends Component {

  constructor() {
    super();
    this.state = {
      count: 0,
      confirmDirty: false,
      visible: false,
      help: '',
      prefix: '86',
    };
  }

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        dispatch({
          type: 'login/updatePassword',
          payload: { ...values},
        });
      }
    });
  };

  getPasswordStatus = () => {
    const { form } = this.props;
    const value = form.getFieldValue('newPassword');
    if (value && value.length > 9) {
      return 'ok';
    }
    if (value && value.length > 5) {
      return 'pass';
    }
    return 'poor';
  };

  checkPassword = (rule, value, callback) => {
    const { visible, confirmDirty } = this.state;
    if (!value) {
      this.setState({
        help: '请输入密码!',
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
    if (value && value !== form.getFieldValue('newPassword')) {
      callback('两次输入的密码不匹配!');
    } else {
      callback();
    }
  };

  renderPasswordProgress = () => {
    const { form } = this.props;
    const value = form.getFieldValue('newPassword');
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

  render() {
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    const { help, visible } = this.state;
    return (
      <Form onSubmit={this.handleSubmit}>
        <FormItem label={'原密码'}>
          {getFieldDecorator('oldPassword', {
            rules: [
              {
                required: true,
                message: '请确认原密码',
              }
            ],
          })(<Input size="large" type="password" placeholder={'原密码'} />)}
        </FormItem>
        <FormItem help={help} label={'新密码 '}>
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
            {getFieldDecorator('newPassword', {
              rules: [
                {
                  required: true,
                  message: '请输入新密码',
                },
                {
                  validator: this.checkPassword,
                },
              ],
            })(<Input size="large" type="password" placeholder={'至少6位密码，区分大小写'} />)}
          </Popover>
        </FormItem>
        <FormItem label={'确认密码'}>
          {getFieldDecorator('confirmPassword', {
            rules: [
              {
                required: true,
                message: '请确认密码',
              }, {
                validator: this.checkConfirm,
              },
            ],
          })(<Input size="large" type="password" placeholder={'确认密码'} />)}
        </FormItem>
        <FormItem>
          <Button
            size="large" loading={submitting}
            className={styles.submit} type="primary" htmlType="submit"
          >
            {'修改密码'}
          </Button>
        </FormItem>
      </Form>
    );
  }
}

export default SecurityView;

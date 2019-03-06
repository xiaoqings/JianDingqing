import React, { Component } from 'react';
import { connect } from 'dva';
import { Form, Input, Select, Button, Popover, Progress, Card } from 'antd';
import styles from '../User/Register.less';
import GeographicView from '../Account/Settings/GeographicView';
import PhoneView from '../Account/Settings/PhoneView';

const FormItem = Form.Item;
const { Option } = Select;

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

const validatorGeographic = (rule, value, callback) => {
  const { province, city } = value;
  if (!province.key) {
    callback('请选择省份!');
  }
  if (!city.key) {
    callback('请选择你在的城市!');
  }
  callback();
};

const validatorPhone = (rule, value, callback) => {
  const values = value.split('-');
  if (!values[0]) {
    callback('请输入你的电话!');
  }
  if (!values[1]) {
    callback('请输入你的手机号!');
  }
  callback();
};

@connect(({ register, loading, user }) => ({
  register,
  submitting: loading.effects['register/submit'],
  currentUser: user.currentUser,
}))
@Form.create()
export default class BaseView extends Component {
  constructor() {
    super();

    this.state = {
      confirmDirty: false,
      visible: false,
      help: '',
    };
  }

  componentDidMount() {
    this.setBaseInfo();

    const { form, register } = this.props;
    const account = form.getFieldValue('mail');
    // if (register.status === 'ok') {
    //   router.push({
    //     pathname: '/user/register-result',
    //     state: {
    //       account,
    //     },
    //   });
    // }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  setBaseInfo = () => {
    const { currentUser, form } = this.props;
    Object.keys(form.getFieldsValue()).forEach(key => {
      const obj = {};
      obj[key] = currentUser[key] || null;
      form.setFieldsValue(obj);
    });
  };

  onGetCaptcha = () => {
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

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        dispatch({
          type: 'user/updateUserInfo',
          payload: { ...values},
        });
      }
    });
  };

  checkConfirm = (rule, value, callback) => {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback('两次输入的密码不匹配!');
    } else {
      callback();
    }
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

  render() {
    const {
      form: { getFieldDecorator },
      submitting,
    } = this.props;
    const { help, visible } = this.state;
    return (
      <Card bordered={false}>
        <div className={styles.main}>
          <h3 style={{ textAlign: 'center', fontSize: '20px' }}>{'商家入驻'}</h3>
          <Form onSubmit={this.handleSubmit} hideRequiredMark>
            <FormItem label={'店铺名称'}>
              {getFieldDecorator('businessAddress', {
                rules: [
                  {
                    required: true,
                    message: '请输入你的店铺名称!',
                  },
                ],
              })(<Input placeholder={'店铺名称'} />)}
            </FormItem>
            <FormItem label={'店铺简介'}>
              {getFieldDecorator('profile', {
                rules: [
                  {
                    required: true,
                    message: '请输入你的店铺简介',
                  },
                ],
              })(<Input.TextArea placeholder={'店铺简介'} rows={4} />)}
            </FormItem>
            <FormItem label={'国家/地区'}>
              {getFieldDecorator('country', {
                rules: [
                  {
                    required: true,
                    message: '请选择你所在的国家',
                  },
                ],
              })(
                <Select style={{ maxWidth: 220 }}>
                  <Option value="China">中国</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label={'所在省市'}>
              {getFieldDecorator('geographic', {
                rules: [
                  {
                    required: true,
                    message: '请选择你所在的省市',
                  },
                  {
                    validator: validatorGeographic,
                  },
                ],
              })(<GeographicView />)}
            </FormItem>
            <FormItem label={'街道地址'}>
              {getFieldDecorator('address', {
                rules: [
                  {
                    required: true,
                    message: '请输入您的街道地址',
                  },
                ],
              })(<Input placehoder={'街道地址'} />)}
            </FormItem>
            <FormItem label={'联系人'}>
              {getFieldDecorator('contact', {
                rules: [
                  {
                    required: true,
                    message: '请输入店铺联系人',
                  },
                ],
              })(<Input placehoder={'店铺联系人'} />)}
            </FormItem>
            <FormItem label={'联系电话'}>
              {getFieldDecorator('phone', {
                rules: [
                  {
                    required: true,
                    message: '请输入您的联系电话!',
                  },
                  { validator: validatorPhone },
                ],
              })(<PhoneView />)}
            </FormItem>
            <FormItem help={help} label={'密码'}>
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
                      required: true,
                      message: '请输入密码',
                    },
                    {
                      validator: this.checkPassword,
                    },
                  ],
                })(
                  <Input
                    defaultValue={'88888888'}
                    size="large"
                    type="password"
                    placeholder={'至少6位密码，区分大小写'}
                  />
                )}
              </Popover>
            </FormItem>
            <FormItem label={'确认密码'}>
              {getFieldDecorator('confirm', {
                rules: [
                  {
                    required: true,
                    message: '请确认密码',
                  },
                  {
                    validator: this.checkConfirm,
                  },
                ],
              })(
                <Input
                  defaultValue={'88888888'}
                  size="large"
                  type="password"
                  placeholder={'确认密码'}
                />
              )}
            </FormItem>
            <FormItem>
              <Button
                size="large"
                loading={submitting}
                style={{ width: '100%' }}
                type="primary"
                htmlType="submit"
              >
                {'确认注册'}
              </Button>
            </FormItem>
          </Form>
        </div>
      </Card>
    );
  }
}

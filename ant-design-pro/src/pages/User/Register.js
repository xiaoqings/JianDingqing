import React, { Component } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import router from 'umi/router';
import { Form, Input, Button, Row, Col, Popover, Progress, message, Icon } from 'antd';
import styles from './Register.less';

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

@connect(({ register, loading }) => ({
  register,
  submitting: loading.effects['register/submit'],
}))
@Form.create()
class Register extends Component {
  state = {
    count: 0,
    confirmDirty: false,
    visible: false,
    help: '',
    prefix: '86',

    code: '',
    codeLength: 4,
    fontSizeMin: 20,
    fontSizeMax: 22,
    backgroundColorMin: 240,
    backgroundColorMax: 250,
    colorMin: 10,
    colorMax: 20,
    lineColorMin: 40,
    lineColorMax: 180,
    contentWidth: 96,
    contentHeight: 38,
    showError: false, // 默认不显示验证码的错误信息

  };

  componentWillMount() {
    this.canvas = React.createRef();
  }

  componentDidUpdate() {
    const { form, register } = this.props;
    const account = form.getFieldValue('mail');
    if (register.status === 'ok') {
      router.push({
        pathname: '/user/register-result',
        state: {
          account,
        },
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  componentDidMount() {
    this.drawPic();
  }
  // 生成一个随机数
  randomNum = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min)
  }

  drawPic = () => {
    this.randomCode()
  }

// 生成一个随机的颜色
  randomColor(min, max) {
    const r = this.randomNum(min, max);
    const g = this.randomNum(min, max);
    const b = this.randomNum(min, max);
    return `rgb(${r},${g},${b})`
  }

  drawText(ctx, txt, i) {
    ctx.fillStyle = this.randomColor(this.state.colorMin, this.state.colorMax)
    let fontSize = this.randomNum(this.state.fontSizeMin, this.state.fontSizeMax)
    ctx.font = fontSize + 'px SimHei'
    let padding = 10;
    let offset = (this.state.contentWidth - 40) / (this.state.code.length - 1)
    let x = padding;
    if (i > 0) {
      x = padding + (i * offset)
    }
    let y = this.randomNum(this.state.fontSizeMax, this.state.contentHeight - 5)
    if (fontSize > 40) {
      y = 40
    }
    let deg = this.randomNum(-10, 10)
// 修改坐标原点和旋转角度
    ctx.translate(x, y)
    ctx.rotate(deg * Math.PI / 180)
    ctx.fillText(txt, 0, 0)
// 恢复坐标原点和旋转角度
    ctx.rotate(-deg * Math.PI / 180)
    ctx.translate(-x, -y)
  }

  drawLine(ctx) {
// 绘制干扰线
    for (let i = 0; i < 1; i++) {
      ctx.strokeStyle = this.randomColor(this.state.lineColorMin, this.state.lineColorMax)
      ctx.beginPath()
      ctx.moveTo(this.randomNum(0, this.state.contentWidth), this.randomNum(0, this.state.contentHeight))
      ctx.lineTo(this.randomNum(0, this.state.contentWidth), this.randomNum(0, this.state.contentHeight))
      ctx.stroke()
    }
  }

  drawDot(ctx) {
// 绘制干扰点
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = this.randomColor(0, 255)
      ctx.beginPath()
      ctx.arc(this.randomNum(0, this.state.contentWidth), this.randomNum(0, this.state.contentHeight), 1, 0, 2 * Math.PI)
      ctx.fill()
    }
  }

  reloadPic = () => {
    this.drawPic()
    this.props.form.setFieldsValue({
      sendcode: '',
    });
  }

  // 输入验证码
  changeCode = e => {
    if (e.target.value.toLowerCase() !== '' && e.target.value.toLowerCase() !== this.state.code.toLowerCase()) {
      this.setState({
        showError: true
      })
    } else if (e.target.value.toLowerCase() === '') {
      this.setState({
        showError: false
      })
    } else if (e.target.value.toLowerCase() === this.state.code.toLowerCase()) {
      this.setState({
        showError: false
      })
    }
  }

// 随机生成验证码
  randomCode() {
    let random = '';
// 去掉了I l i o O
    const str = 'QWERTYUPLKJHGFDSAZXCVBNMqwertyupkjhgfdsazxcvbnm1234567890'
    for (let i = 0; i < this.state.codeLength; i++) {
      let index = Math.floor(Math.random() * 57);
      random += str[index];
    }
    this.setState({
      code: random
    },()=>{
      // let canvas = this.canvas.current;
      let canvas = document.getElementById('canvas');
      let ctx = canvas.getContext('2d');
      ctx.textBaseline = 'bottom';
// 绘制背景
      ctx.fillStyle = this.randomColor(this.state.backgroundColorMin, this.state.backgroundColorMax);
      ctx.fillRect(0, 0, this.state.contentWidth, this.state.contentHeight);

// 绘制文字
      for (let i = 0; i < this.state.code.length; i++) {
        this.drawText(ctx, this.state.code[i], i)
      }
      this.drawLine(ctx)
      this.drawDot(ctx)
    })
  }

  onGetCaptcha = async () => {
    const { form, dispatch } = this.props;
    let code = this.state.code;
    await form.validateFields({ force: true }, (err, values) => {
      if(!(code === values.sendcode)) {
        return message.info('校验码输入错误！');
      }
    });

    const { mobile } = this.state;
    if (!mobile) {
      return message.error('请输入手机号!');
    }

    dispatch({
      type: 'register/send',
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
    let code = this.state.code;
    form.validateFields({ force: true }, (err, values) => {
      if(!(code === values.sendcode)) {
        return message.info('校验码输入错误！');
      }
      if (!err) {
        dispatch({
          type: 'register/submit',
          payload: { ...values },
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
    const { form, submitting } = this.props;
    const { getFieldDecorator } = form;
    const { count, help, visible } = this.state;

    return (
      <div className={styles.main}>
        <h3 style={{ textAlign: 'center', fontSize: '24px' }}>{'商家入驻'}</h3>
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
                {getFieldDecorator('sendcode', {
                  rules: [
                    {
                      required: true,
                      message: '请输入校验码',
                    },
                  ],
                })(
                  <Input
                    size="large"
                    onChange={this.changeCode}
                    placeholder="请输入校验码"
                  />
                )}
              </Col>
              <Col span={8}>
                <canvas id="canvas" width="120" height="38" onClick={() => this.reloadPic()} />
              </Col>
            </Row>
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
              })(<Input size="large" type="password" placeholder={'至少6位密码，区分大小写'} />)}
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
              {'立即注册'}
            </Button>
            <Link className={styles.login} to="/User/Login">
              {'使用已有账户登录'}
            </Link>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default Register;

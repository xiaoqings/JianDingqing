import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Card, Form, Input, DatePicker, Button, Modal, Icon, InputNumber, Row, Col, message } from 'antd';
import styles from '../../List/TableList.less';
import moment from 'moment';
import {getFirstAndLastMonthDay } from '../../../utils/utils';
import Authorized from '@/utils/Authorized';

const Search = Input.Search;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

@connect(({ user,loading }) => ({
  list : user,
  currentUser: user.currentUser,
  submitSuccess: user.submitSuccess,
  sendSuccess: user.sendSuccess,
  loading: loading.effects['user/fetchList'],
}))
@Form.create()
export default  class Shopping extends PureComponent {
  constructor() {
    super();

    this.state = {
      startDate:getFirstAndLastMonthDay().firstdate,
      endDate: getFirstAndLastMonthDay().lastdate,

      count: 0,
      money : 0,
      mobile : '',
    };

    this.pages = {
      pageIndex: 1,
      pageSize: 5,
      pageCount: 0,
    };

    this.columns = [
      {
        title: '编号',
        dataIndex: 'consumptionId',
      }, {
        title: '顾客电话',
        dataIndex: 'customerPhone',
      }, {
        title: '消费消费点',
        dataIndex: 'consumptionShoppingSpot',
      }, {
        title: '剩余消费点',
        dataIndex: 'surplusConsumption',
      }, {
        title: '消费时间',
        dataIndex: 'consumptionShoppingSpotTime',
      },
    ];
  }

  componentWillReceiveProps(nextProps) {
    this.props = {
      ...nextProps
    };
    const { list: { page,list },submitSuccess,sendSuccess } = nextProps;
    if (page) {
      this.pages.pageIndex = page.pageIndex || 1;
      this.pages.pageSize = page.pageSize || 1;
      this.pages.pageCount = page.totalCount || 1;
    }

    if(list){
      this.setState({countMoney:list.unWriteOffSsc || 0})
    }

    if(submitSuccess && this.timer){
      this.setState({
        isSubmit:false,
        visible:false,
        showMobileModal:false,
      });
      this.getData();
      this.timer = null;
    }

    if(sendSuccess && this.timers){
      this.setState({showMobileModal:true});
      this.timers = null;
    }
  }

  componentDidMount() {
    const { list: { page }} = this.props;
    if (page) {
      this.pages.pageIndex = page.pageIndex || 1;
      this.pages.pageSize = page.pageSize || 1;
      this.pages.pageCount = page.totalCount || 1;
    }
    this.getData();
  }

  getData = () => {
    const { dispatch,currentUser } = this.props;
    const { searchValue,startDate, endDate } = this.state;
    const params = {
      pageIndex: this.pages.pageIndex,
      pageSize: this.pages.pageSize,
      startTime: startDate,
      endTime: endDate,
      businessCode : currentUser.userid,
      customerPhone: searchValue || '',
      isWriteOff : 2
    };
    dispatch({
      type: 'user/fetchList',
      payload: params,
    });
  };

  // todo 添加消费点
  handleSubmit = (e) => {
    e.preventDefault();
    this.setState({isSubmit:true});
    this.timer = true;
    const {form,dispatch,submitSuccess=false,type} = this.props;
    if(submitSuccess){return false;}

    form.validateFields((err, values) => {
      if (!err) {
        values.type = this.state.type;
        dispatch({
          type: 'user/addShopping',
          payload: { ...values },
        });
        this.setState({visible:false});
      }
    });
  };

  // todo 发送核销短信验证码
  _sendHeXiaoSMS = () => {
    const {countMoney = 0} = this.state;
    if(countMoney === 0){
      return message.warn(`您当前消费点为 0, 无法进行核销! `);
    }
    const { dispatch ,currentUser} = this.props;
    Modal.confirm({
      title: '【微睐美】消费点核销',
      content: `您确定要核销 【${countMoney}】 消费点吗?`,
      okText : '确认核销并发送验证码',
      cancelText : '取消',
      onCancel : () => { return false},
      onOk : () => {
        this.timers = true;
        dispatch({
          type: 'user/sendHeXiaoSMS',
          payload: {
            businessCode : currentUser.userid,
            businessPhone : currentUser.phone,
            hxSsc : countMoney
          },
        });
      }
    });
  };

  // todo  核销消费点
  _HeXiaoShpping = () => {
    const {verifyCode} = this.state;
    if(!verifyCode || verifyCode == ''){
      return message.warn('请输入短信验证码!');
    }
    const { dispatch ,currentUser,submitSuccess=false} = this.props;
    if(submitSuccess){
      return false;
    }
    this.setState({isSubmit:true});
    this.timer = true;
    dispatch({
      type: 'user/HeXiaoShpping',
      payload: {
        businessCode : currentUser.userid,
        code : verifyCode,
      }
    });
  };

  // todo 发送短信验证码
  onGetCaptcha = () => {
    const { dispatch } = this.props;
    const { mobile, money} = this.state;
    if (!mobile) {
      return message.error('请输入手机号!');
    }
    if (!money || money == 0 || money == '') {
      return message.error('请输入兑换的消费点数!');
    }

    dispatch({
      type: 'user/sendSMS',
      payload: { mobile, money},
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

  render() {
    const {
      list: { list },
      loading = false,
      form,
      isHeXiao = false,
    } = this.props;

    const { getFieldDecorator } = form;
    const {
      startDate, endDate, visible = false,type = 1,mobile,money,count,
      isSubmit = false,
    } = this.state;

    return (
      <Card bordered={false}>
        <h2 style={{textAlign:'center',fontWeight:600}} >{'消费点管理'}</h2>
        <div style={{display:'flex',flexDirection:'column',marginBottom:20,marginTop:20}} >

          <Authorized authority={['admin']} >
            <Button
              style={{marginTop:10,width:'100%'}}
              type="primary" icon="pay-circle" size={20}
              onClick={() => this.setState({visible:true,type : 1})}
            >
              {'充值消费点'}
            </Button>
          </Authorized>

          <Button
            style={{marginTop:10,width:'100%'}}
            type="primary" icon="swap" size={20}
            onClick={() => this.setState({visible:true,type : 2})}
          >
            {'消费点兑换商品'}
          </Button>

          <div style={{textAlign:'right'}} >
            <RangePicker
              style={{marginTop:10,marginRight:10}}
              defaultValue={[moment(startDate, dateFormat), moment(endDate, dateFormat)]}
              format={dateFormat}
              onChange={(dates, dateStrings) =>this.setState({ startDate: dateStrings[0], endDate: dateStrings[1] })}
            />
            <Search
              placeholder={'顾客电话'}
              value={this.state.searchValue || ''}
              onChange={(e) => this.setState({ searchValue: e.target.value })}
              onSearch={() => this.getData()}
              style={{ width:250,marginTop:10}}
              enterButton
            />
          </div>

        </div>

        <div className={styles.tableList} >
          <Table
            loading={loading}
            dataSource={list.sscList || []}
            columns={this.columns}
            pagination={{
              current: this.pages.pageIndex,
              pageSize: this.pages.pageSize,
              total: this.pages.pageCount,
            }}
            onChange={pagination => {
              this.pages.pageIndex = pagination.current;
              this.getData();
            }}
            footer={() => {
              return(
                <div style={{textAlign:'right',background:'#4fff1852',padding:'5px'}} >
                  <span>{'未核销的消费点数 : '}</span>
                  <strong style={{fontSize:'20px',paddingRight:10}} >{this.state.countMoney || 0 }</strong>
                </div>
              )
            }}
          />
        </div>

        <Authorized authority={['user']} >
          <Button
            style={{marginTop:10,width:'100%'}}
            type="primary" icon="swap" size={20}
            onClick={this._sendHeXiaoSMS}
          >
            {isHeXiao ? '正在核销处理...' : '核销消费点'}
          </Button>
        </Authorized>

        <Modal
          title={type === 1 ? '消费点充值' : '消费点数兑换商品'}
          visible={visible}
          maskClosable={false}
          onCancel={() => this.setState({visible:false})}
          footer={[
            <Button key="back" onClick={() => this.setState({visible:false})}>{'关闭'}</Button>,
          ]}
        >
          <Form onSubmit={this.handleSubmit} className="login-form">
            <Form.Item>
              {getFieldDecorator('customerPhone', {
                initialValue : mobile,
                rules: [{ required: true, message: '请输入手机号!' }],
              })(
                <Input
                  size="large"
                  prefix={<Icon type="phone" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  onChange={e => this.setState({ mobile: e.target.value })}
                  placeholder={'手机号'}
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('money', {
                initialValue : money,
                rules: [{ required: true, message: '请输入消费点数!' }],
              })(
                <InputNumber
                  size="large"
                  style={{width:'100%'}}
                  placeholder={type === 1 ? "充值消费点数" : '兑换消费点数'}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  prefix={<Icon type="money-collec" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  onChange={e => this.setState({ money: e })}
                />
              )}
            </Form.Item>
            {
              type === 1 ? null :
                <Form.Item>
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
                </Form.Item>
            }
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{width:'100%'}} >
                {isSubmit? '提交中...' : (type === 1 ? '立即充值' : '立即兑换')}
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title={'请输入短信验证码'}
          visible={this.state.showMobileModal || false}
          maskClosable={false}
          onCancel={() => this.setState({showMobileModal:false})}
          footer={[
            <Button key="back" onClick={() => this.setState({showMobileModal:false})}>{'关闭'}</Button>,
            <Button key={'primary'} type={'primary'} onClick={this._HeXiaoShpping}>{'确认'}</Button>
          ]}
        >
          <Input
            size="large"
            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
            onChange={e => this.setState({ verifyCode: e.target.value })}
            placeholder={'请输入短信验证码'}
          />
        </Modal>

      </Card>
    );
  }
}

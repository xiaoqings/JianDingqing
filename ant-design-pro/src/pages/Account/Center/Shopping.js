import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Card, Form, Input, DatePicker, Button, Modal, Icon, InputNumber, Row, Col, message } from 'antd';
import styles from '../../List/TableList.less';
import moment from 'moment';
import { getDateString } from '../../../utils/utils';
import Authorized from '@/utils/Authorized';

const Search = Input.Search;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

@connect(({ user,loading }) => ({
  list : user,
  currentUser: user.currentUser,
  loading: loading.effects['user/fetchList'],
  isSubmit: loading.effects['user/addShopping'],
  isHeXiao: loading.effects['user/HeXiaoShpping'],
}))
@Form.create()

export default  class Shopping extends PureComponent {
  constructor() {
    super();

    let date = new Date();
    this.state = {
      startDate: getDateString(`${date.getFullYear()}-${date.getMonth()-1}-${date.getDate()}`),
      endDate: getDateString(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`),

      count: 0,
      mobile : '',
      money : 0
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
        title: '消费购物点',
        dataIndex: 'consumptionShoppingSpot',
      }, {
        title: '剩余购物点',
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
    const { list: { page },isSubmit } = nextProps;
    if (page) {
      this.pages.pageIndex = page.pageIndex || 1;
      this.pages.pageSize = page.pageSize || 1;
      this.pages.pageCount = page.totalCount || 1;
    }
    if(isSubmit){
      this.getData();
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
    console.log('currentUser ==> ',currentUser);
    const params = {
      pageIndex: this.pages.pageIndex,
      pageSize: this.pages.pageSize,
      startTime: startDate,
      endTime: endDate,
      businessCode : currentUser.userid,
      customerPhone: searchValue || '',
    };
    dispatch({
      type: 'user/fetchList',
      payload: params,
    });
  };

  // todo 添加购物点
  handleSubmit = (e) => {
    e.preventDefault();
    const {form,dispatch,isSubmit=false,type} = this.props;
    if(isSubmit){return false;}
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

  // todo  核销购物点
  _HeXiaoShpping = () => {
    const { dispatch ,currentUser,isHeXiao=false} = this.props;
    if(isHeXiao){
      return false;
    }
    console.log(currentUser);
    dispatch({
      type: 'user/HeXiaoShpping',
      payload: {
        businessCode : currentUser.userid
      },
    });
  };

  render() {
    const {
      list: { list },
      loading = false,
      form,
      isSubmit = false,
      isHeXiao = false,
    } = this.props;
    const { getFieldDecorator } = form;
    const {startDate, endDate, visible = false,type = 1,mobile,money} = this.state;
    return (
      <Card bordered={false}>
        <h2 style={{textAlign:'center',fontWeight:600}} >{'购物点管理'}</h2>
        <div style={{display:'flex',flexDirection:'column',marginBottom:20,marginTop:20}} >
          <Authorized authority={['admin']} >
            <Button
              style={{marginTop:10,width:'100%'}}
              type="primary" icon="pay-circle" size={20}
              onClick={() => this.setState({visible:true,type : 1})}
            >
              {'充值购物点'}
            </Button>
          </Authorized>
          <Button
            style={{marginTop:10,width:'100%'}}
            type="primary" icon="swap" size={20}
            onClick={() => this.setState({visible:true,type : 2})}
          >
            {'购物点兑换商品'}
          </Button>
          <div style={{textAlign:'right'}} >
            <RangePicker
              style={{marginTop:10,marginRight:10}}
              defaultValue={[moment(startDate, dateFormat), moment(endDate, dateFormat)]}
              format={dateFormat}
              onChange={(dates, dateStrings) => {
                this.setState({ startDate: dateStrings[0], endDate: dateStrings[1] }, () =>
                  this.getData()
                );
              }}
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
            dataSource={list}
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
          />
        </div>

        <Authorized authority={['user']} >
          <Button
            style={{marginTop:10,width:'100%'}}
            type="primary" icon="swap" size={20}
            onClick={this._HeXiaoShpping}
          >
            {isHeXiao ? '正在核销处理...' : '核销购物点'}
          </Button>
        </Authorized>

        <Modal
          title={type === 1 ? '购物点充值' : '购物点数兑换商品'}
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
                rules: [{ required: true, message: '请输入手机号!' }],
              })(
                <Input
                  prefix={<Icon type="phone" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="手机号"
                />
              )}
            </Form.Item>
            <Form.Item>
              {getFieldDecorator('money', {
                rules: [{ required: true, message: '请输入购物点数!' }],
              })(
                <InputNumber
                  style={{width:'100%'}}
                  placeholder={type === 1 ? "充值购物点数" : '兑换购物点数'}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  prefix={<Icon type="money-collec" style={{ color: 'rgba(0,0,0,.25)' }} />}
                />
              )}
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{width:'100%'}} >
                {isSubmit? '提交中...' : (type === 1 ? '立即充值' : '立即兑换')}
              </Button>
            </Form.Item>
          </Form>
        </Modal>

      </Card>
    );
  }
}

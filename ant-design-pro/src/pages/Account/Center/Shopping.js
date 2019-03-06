import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Card, Form, Input, DatePicker, Button, Modal, Icon, InputNumber  } from 'antd';
import styles from '../../List/TableList.less';
import moment from 'moment';
import { getDateString } from '../../../utils/utils';
import Authorized from '@/utils/Authorized';

const Search = Input.Search;

const { RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

@connect(({ list, loading }) => ({
  list,
  loading: loading.effects['list/fetchLog'],
}))
@Form.create()
export default  class Shopping extends PureComponent {
  constructor() {
    super();

    this.state = {
      startDate: getDateString(new Date()),
      endDate: getDateString(new Date()),
    };

    this.pages = {
      pageIndex: 1,
      pageSize: 10,
      pageCount: 0,
    };

    this.columns = [
      {
        title: '编号',
        dataIndex: 'loginId',
      },
      {
        title: '登录商户',
        dataIndex: 'businessName',
        render: val => val || '-',
      },
      {
        title: '登录IP',
        dataIndex: 'ip',
      },
      {
        title: '登陆时间',
        dataIndex: 'loginTime',
        // render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      },
    ];
  }

  componentWillReceiveProps(nextProps) {
    const {
      list: { page },
    } = nextProps;
    if (page) {
      this.pages.pageIndex = page.pageIndex || 1;
      this.pages.pageSize = page.pageSize || 1;
      this.pages.pageCount = page.totalCount || 1;
    }
  }

  componentDidMount() {
    const {
      list: { page },
    } = this.props;

    if (page) {
      this.pages.pageIndex = page.pageIndex || 1;
      this.pages.pageSize = page.pageSize || 1;
      this.pages.pageCount = page.totalCount || 1;
    }

    this.getData();
  }

  getData = () => {
    const { dispatch } = this.props;
    const { searchValue, startDate, endDate } = this.state;
    const params = {
      pageIndex: this.pages.pageIndex,
      pageSize: this.pages.pageSize,
      businessName: searchValue || '',
      startTime: startDate,
      endTime: endDate,
    };
    dispatch({
      type: 'list/fetchLog',
      payload: params,
    });
  };


  // todo 添加或者删除购物点
  handleSubmit = (e) => {
    e.preventDefault();
    const { type = 0 } = this.state;
    const {form,dispatch} = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        console.log('Received values of form: ', values);
        if(type === 0){  // todo 购物点数兑换商品

        }else {  // todo 充值购物点
          dispatch({
            type: 'user/addShopping',
            payload: { ...values },
          });
        }
      }
    });
  };


  render() {
    const {
      list: { list },
      loading = false,
      form
    } = this.props;
    const { getFieldDecorator } = form;

    const { searchValue, startDate, endDate,
      visible = false,
      type = 0
    } = this.state;

    return (
      <Card bordered={false}>
        <div>{'购物点管理'}</div>
        <div style={{display:'flex',flexDirection:'column',marginBottom:20,marginTop:20}} >
          <Authorized authority={['admin']} >
            <Button
              type="primary" icon="pay-circle" size={20}
              onClick={() => this.setState({visible:true,type:1})}
            >
              {'充值购物点'}
            </Button>
          </Authorized>
          <Button
            style={{marginTop:20}}
            type="primary" icon="swap" size={20}
            onClick={() => this.setState({visible:true,type:0})}
          >
            {'购物点兑换商品'}
          </Button>
        </div>

        <div className={styles.tableList} >
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <RangePicker
              defaultValue={[moment(startDate, dateFormat), moment(endDate, dateFormat)]}
              format={dateFormat}
              onChange={(dates, dateStrings) => {
                this.setState({ startDate: dateStrings[0], endDate: dateStrings[1] }, () =>
                  this.getData()
                );
              }}
            />
            <Search
              placeholder="搜索"
              value={searchValue || ''}
              onSearch={value => this.setState({ searchValue: value }, () => this.getData())}
              style={{ width: 250, marginLeft: 10 }}
              enterButton
            />
          </div>
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

        <Modal
          title={(type === 0) ? '购物点数兑换商品' : '充值购物点数'}
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
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  prefix={<Icon type="money-collec" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="充值购物点数"
                />
              )}
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="login-form-button">{'立即充值'}</Button>
            </Form.Item>
          </Form>
        </Modal>

      </Card>
    );
  }
}

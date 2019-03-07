import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Table, Card, Form, Input, Divider, Modal, Button, DatePicker, message} from 'antd';
import { getDateString } from '../../utils/utils';

const Search = Input.Search;
const { RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD HH:mm:ss';

@connect(({ list, loading }) => ({
  list,
  loading: loading.effects['list/fetchBusinessList'],
}))
@Form.create()
export default class Merchants extends PureComponent {
  constructor() {
    super();

    this.state = {
    };

    this.pages = {
      pageIndex: 1,
      pageSize: 10,
      pageCount: 0,
    };

    this.columns = [
      {
        title: '编号',
        dataIndex: 'businessDetailId',
      },
      {
        title: '商家名称',
        dataIndex: 'businessName',
      },
      {
        title: '联系人',
        dataIndex: 'businessContact',
      },
      {
        title: '联系电话',
        dataIndex: 'businessPhone',
      },
      {
        title: '商家地址',
        dataIndex: 'businessAddress',
      },
      {
        title: '未核销的购物点数',
        dataIndex: 'totalConsumptionShoppingSpot',
        width : '100px',
        render: (text, record) => {
          return (
            <div>
              {text}
              <Divider type="vertical" />
              <a onClick={() => this.setState({visible:true,type : 1,infoCode :record.businessCode})} >详情</a>
            </div>
          );
        },
      },
      {
        title: '入驻时间',
        dataIndex: 'createAt',
        render: val => <span>{getDateString(val)}</span>,
      },
      {
        title: '操作',
        dataIndex: 'createAt',
        width : '200px',
        render: (text, record) => {
          return (
            <Fragment>
              <a onClick={() => this.setState({visible:true, type : 2,infoCode :record.businessCode })}>核销记录</a>
              <Divider type="vertical" />
              <a >设置核销时间</a>
            </Fragment>
          );
        },
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

  // todo 加载获得数据
  getData = () => {
    const { dispatch } = this.props;
    const params = {
      pages: {
        ...this.pages,
      },
      searchValue: this.state.searchValue || '',
    };
    dispatch({
      type: 'list/fetchBusinessList',
      payload: params,
    });
  };

  render() {
    const {
      list: { list },
      loading = false,
    } = this.props;

    const { searchValue, type = 1,infoCode = null} = this.state;

    return (
      <Card bordered={false}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h2>{'商家管理列表'}</h2>
          <Search
            style={{ width: 300 }}
            value={searchValue || ''}
            placeholder={'搜索名称/联系人/电话号码'}
            enterButton="搜索"
            onSearch={() => {
              this.pages.pageIndex = 1;
              this.setState({ searchValue: value }, () => this.getData());
            }}
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

        <Modal
          width={'80%'}
          title={type === 1 ? '未核销的购物点列表' : '核销记录'}
          visible={this.state.visible || false}
          maskClosable={false}
          onCancel={() => this.setState({visible:false})}
          footer={[
            <Button key="back" onClick={() => this.setState({visible:false})}>{'关闭'}</Button>,
          ]}
        >
          <WaitDoneTable
            businessType={type}
            businessCode={infoCode}
          />
        </Modal>

      </Card>
    );
  }
}


@connect(({ user, loading }) => ({
  list : user,
  loading: loading.effects['user/sscByCondition'],
}))
export class WaitDoneTable extends PureComponent{
  constructor(){
    super();

    let date = new Date();
    this.state = {
      startDate: getDateString(),
      endDate: getDateString(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`),
    };

    this.pages = {
      pageIndex: 1,
      pageSize: 5,
      pageCount: 0,
    };

  }

  componentWillReceiveProps(nextProps) {
    this.props = {
      ...nextProps
    };
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

  // todo 顾客购物点【未核销】消费列表【总经销可看和分销商可看】
  getData = () => {
    const { dispatch,businessCode,businessType } = this.props;
    console.log(businessCode);
    if(!businessCode){return message.error('商户信息参数错误!')}
    const { searchValue, startDate, endDate} = this.state;
    const params = {
      businessCode : businessCode,
      pageIndex : this.pages.pageIndex,
      pageSize : this.pages.pageSize,
      // startTime : startDate,
      // endTime : endDate,
      // searchValue : searchValue,
    };

    // 详情
    if(parseInt(businessType) === 1){
      dispatch({
        type: 'user/sscByCondition',
        payload: params,
      });
    }else {
      dispatch({
        type: 'user/alreadyWriteoff',
        payload: params,
      });
    }
  };

  render(){
    const {
      list: { list },
      loading = false,
      businessType,
    } = this.props;

    const { searchValue, startDate, endDate} = this.state;

    let columns = [
      {
        title: '编号',
        dataIndex: 'consumptionId',
      },{
        title: '客户电话',
        dataIndex: 'customerPhone',
      },{
        title: '兑换购物点数',
        dataIndex: 'consumptionShoppingSpot',
      },{
        title: '剩余购物点数',
        dataIndex: 'surplusConsumption',
      },{
        title: '兑换时间',
        dataIndex: 'consumptionShoppingSpotTime',
      },
    ];
    return(
      <div>
        <h2 style={{textAlign:'center'}} >
          {(businessType && parseInt(businessType) === 1) ? '未核销的购物点列表': '核销记录'}
        </h2>
        {/*<RangePicker*/}
        {/*style={{marginTop:10,marginRight:15}}*/}
        {/*defaultValue={[moment(startDate, dateFormat), moment(endDate, dateFormat)]}*/}
        {/*format={dateFormat}*/}
        {/*onChange={(dates, dateStrings) => {*/}
        {/*this.setState({ startDate: dateStrings[0], endDate: dateStrings[1] }, () =>*/}
        {/*this.getData()*/}
        {/*);*/}
        {/*}}*/}
        {/*/>*/}
        {/*<Search*/}
        {/*style={{ width: 300 ,marginTop:10}}*/}
        {/*value={searchValue || ''}*/}
        {/*placeholder={'搜索名称/联系人/电话号码'}*/}
        {/*enterButton="搜索"*/}
        {/*onSearch={() => {*/}
        {/*this.pages.pageIndex = 1;*/}
        {/*this.setState({ searchValue: value }, () => this.getData());*/}
        {/*}}*/}
        {/*/>*/}
        <Table
          loading={loading}
          dataSource={list}
          columns={columns}
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
    )
  }

}

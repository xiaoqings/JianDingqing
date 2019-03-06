import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Table, Card, Form, Input, Divider } from 'antd';
import { getDateString } from '../../utils/utils';

const Search = Input.Search;

@connect(({ list, loading }) => ({
  list,
  loading: loading.effects['list/fetchBusinessList'],
}))
@Form.create()
export default class Merchants extends PureComponent {
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

    this.pages = {
      pageIndex: 1,
      pageSize: 20,
      pageCount: 0,
    };
  }

  /**
   totalConsumptionShoppingSpot: 650
   * @type {*[]}
   */

  columns = [
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
            <a href="#">详情</a>
          </div>
        );
      },
    },
    {
      title: '入驻时间',
      dataIndex: 'createAt',
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      dataIndex: 'createAt',
      width : '200px',
      render: (text, record) => {
        return (
          <Fragment>
            <a href="#">核销记录</a>
            <Divider type="vertical" />
            <a href="#">设置核销时间</a>
          </Fragment>
        );
      },
    },
  ];

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

    const { searchValue, startDate, endDate } = this.state;

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
      </Card>
    );
  }
}

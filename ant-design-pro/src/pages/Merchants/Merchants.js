import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Table, Card, Form, Input, Divider } from 'antd';

const Search = Input.Search;

@connect(({ rule, loading }) => ({
  rule,
  loading: loading.models.rule,
}))
@Form.create()
export default class Merchants extends PureComponent {
  constructor() {
    super();

    this.state = {};

    this.pages = {
      pageIndex: 1,
      pageSize: 20,
      pageCount: 0,
    };
  }

  columns = [
    {
      title: '序号',
      dataIndex: 'key',
    },
    {
      title: '编号',
      dataIndex: 'num',
    },
    {
      title: '商家名称',
      dataIndex: 'name',
    },
    {
      title: '联系人',
      dataIndex: 'name',
    },
    {
      title: '联系电话',
      dataIndex: 'phone',
    },
    {
      title: '商家地址',
      dataIndex: 'name',
    },
    {
      title: '入驻时间',
      dataIndex: 'createAt',
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '操作',
      dataIndex: 'createAt',
      render: (text, record) => {
        return (
          <Fragment>
            <a>详细信息</a>
            <Divider type="vertical" />
            <a href="#">核销记录</a>
            <Divider type="vertical" />
            <a href="#">删除</a>
          </Fragment>
        );
      },
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'rule/fetch',
    });
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
      type: 'rule/fetch',
      payload: params,
    });
  };

  render() {
    const { data = [], loading } = this.props;
    const dataSource = [
      {
        key: '1',
        num: '1321564',
        name: 'Sec Hub',
        phone: '159 xxxx 2356',
        createAt: new Date(),
      },
      {
        key: '2',
        num: '1321564',
        name: 'Sec Hub',
        phone: '159 xxxx 2356',
        createAt: new Date(),
      },
    ];

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
            placeholder={'搜索名称/联系人/电话号码/地址'}
            enterButton="搜索"
            onSearch={() => {
              this.pages.pageIndex = 1;
              this.setState({ searchValue: value }, () => this.getData());
            }}
          />
        </div>
        <Table
          loading={loading}
          dataSource={dataSource}
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

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Table, Card, Form } from 'antd';
import styles from '../../List/TableList.less';

@connect(({ rule, loading }) => ({
  rule,
  loading: loading.models.rule,
}))
@Form.create()
class List extends PureComponent {
  constructor() {
    super();

    this.pages = {
      pageIndex: 1,
      pageSize: 20,
      pageCount: 0,
    };
  }

  state = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    stepFormValues: {},
  };

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
      title: '登录商户',
      dataIndex: 'num',
    },
    {
      title: '登录IP',
      dataIndex: 'ip',
    },
    {
      title: '登陆时间',
      dataIndex: 'createAt',
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
  ];

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'rule/fetch',
    });
  }

  getData = () => {
    const { dispatch } = this.props;
    const params = {
      pages: {
        ...this.pages,
      },
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
        createAt: new Date(),
        ip: '127.0.0.1',
      },
      {
        key: '1',
        num: '1321564',
        createAt: new Date(),
        ip: '127.0.0.1',
      },
    ];

    return (
      <Card bordered={false}>
        <div className={styles.tableList}>
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
        </div>
      </Card>
    );
  }
}

export default List;

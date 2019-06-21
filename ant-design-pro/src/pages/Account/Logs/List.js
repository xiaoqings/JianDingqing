import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Card, Form, Input, DatePicker } from 'antd';
import styles from '../../List/TableList.less';
import moment from 'moment';
import {getFirstAndLastMonthDay } from '../../../utils/utils';

const Search = Input.Search;

const { RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD';

@connect(({ list, loading }) => ({
  list,
  loading: loading.effects['list/fetchLog'],
}))
@Form.create()

class List extends PureComponent {
  constructor() {
    super();

    this.state = {
      startDate: getFirstAndLastMonthDay().firstdate,
      endDate: getFirstAndLastMonthDay().lastdate,
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

  render() {
    const {
      list: { list },
      loading = false,
    } = this.props;

    const { searchValue, startDate, endDate } = this.state;

    return (
      <Card bordered={false}>
        <div className={styles.tableList}>
          <div style={{ textAlign: 'right', marginBottom: 20 }}>
            <RangePicker
              defaultValue={[moment(startDate, dateFormat), moment(endDate, dateFormat)]}
              format={dateFormat}
              onChange={(dates, dateStrings) =>this.setState({ startDate: dateStrings[0], endDate: dateStrings[1] })}
            />
            <Search
              style={{ width: 250, marginLeft: 10 }}
              defaultValue={searchValue || ''}
              placeholder={'搜索名称'}
              enterButton="查询"
              onSearch={(value) => {
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
        </div>
      </Card>
    );
  }
}

export default List;

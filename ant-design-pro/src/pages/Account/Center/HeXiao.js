import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Table, Card, Form, Input, DatePicker } from 'antd';
import styles from '../../List/TableList.less';
import moment from 'moment';
import {getFirstAndLastMonthDay } from '../../../utils/utils';

const Search = Input.Search;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

@connect(({ user,loading }) => ({
  list : user,
  currentUser: user.currentUser,
  loading: loading.effects['user/HeXiaoList'],
}))
@Form.create()

export default  class HeXiao extends PureComponent {
  constructor() {
    super();

    this.state = {
      startDate: getFirstAndLastMonthDay().firstdate,
      endDate: getFirstAndLastMonthDay().lastdate,

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
      type: 'user/HeXiaoList',
      payload: params,
    });
  };

  render() {
    const {
      list: { list },
      loading = false,
    } = this.props;

    const {startDate, endDate} = this.state;

    return (
      <Card bordered={false}>
        <h2 style={{textAlign:'center',fontWeight:600}} >{'核销记录'}</h2>
        <div style={{display:'flex',flexDirection:'column',marginBottom:20,marginTop:20}} >
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

      </Card>
    );
  }
}

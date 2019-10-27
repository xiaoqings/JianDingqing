import React, { Component } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Table, Input, DatePicker, message } from 'antd';
import { getFirstAndLastMonthDay } from '../../utils/utils';
import { requestFetch } from '../../utils/request';

const Search = Input.Search;
const { RangePicker } = DatePicker;

const dateFormat = 'YYYY-MM-DD';

// @connect(({ list, loading }) => ({
//   list,
//   loading: loading.effects['list/queryList'],
// }))
class QueryList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchValue : '',
      startDate: getFirstAndLastMonthDay().firstdate,
      endDate: getFirstAndLastMonthDay().lastdate,
    };

    this.pages = {
      pageIndex: 1,
      pageSize: 10,
      pageCount: 0,
    };
  }
  componentDidMount() {
    this.setStyle();
  }

  componentWillUnmount(){

  }

  setStyle = () => {
    let arr = document.getElementsByClassName('query_list');
    for(let i = 0; i < arr.length; i++){
      arr[i].style.display = 'none';
    }
    let padd = document.getElementsByClassName('query_padding');
    for(let i = 0; i < padd.length; i++){
      padd[i].style.padding = 0;
    }
  };

  // todo 加载获得数据
  getData = async () => {
    const {searchValue, startDate, endDate} = this.state;
    const params = {
      pageIndex: this.pages.pageIndex,
      pageSize: this.pages.pageSize,
      customerPhone: searchValue || '',
      startTime: startDate,
      endTime: endDate,
    };

    this.setState({loading:true});
    const response = await requestFetch('/customer/find', { method: 'POST', body: params });
    this.setState({loading:false});
    if (!(response && response.status === 200)) {
      return message.error(response.message);
    }
    const { data = [], page} = response;
    if (page) {
      this.pages.pageIndex = page.pageIndex || 1;
      this.pages.pageSize = page.pageSize || 1;
      this.pages.pageCount = page.totalCount || 1;
    }
    this.setState({data})
  };

  render() {
    // const {
    //   list : { list },
    //   loading = false
    // } = this.props;
    const {data = [], loading = false, searchValue, startDate, endDate } = this.state;

    const {pageIndex,pageSize} = this.pages;
    const columns = [
      {
        title: '序号',
        render: (text, record, index) => {
          let num = (index + 1) + (pageIndex - 1) * pageSize;
          return (`${num}`);
        }
      }, {
        title: '店铺名称',
        dataIndex: 'businessName',
      }, {
        title: '联系人',
        dataIndex: 'businessContact',
      }, {
        title: '店铺地址',
        dataIndex: 'businessAddress',
      }, {
        title: '使用的消费点',
        dataIndex: 'consumptionShoppingSpot',
      }, {
        title: '消费时间',
        dataIndex: 'consumptionShoppingSpotTime',
      }
    ];

    return (
      <div style={{marginTop:20, padding:10 }} >
        <h2 style={{textAlign:'center',marginBottom:20}} >{'消费点自助查询'}</h2>
        <div style={{ textAlign: 'right', marginBottom: 20 }}>
          <RangePicker
            defaultValue={[moment(startDate, dateFormat), moment(endDate, dateFormat)]}
            format={dateFormat}
            onChange={(dates, dateStrings) => this.setState({ startDate: dateStrings[0], endDate: dateStrings[1] })}
          />
          <Search
            style={{ width: 300 , marginBottom:20,marginLeft:10}}
            defaultValue={searchValue || ''}
            placeholder={'请输入你的电话'}
            enterButton={'查询'}
            onSearch={(value) => {
              this.pages.pageIndex = 1;
              this.setState({ searchValue: value }, () => this.getData());
            }}
          />
        </div>

        <Table
          loading={loading}
          dataSource={data}
          scroll={{x:true}}
          columns={columns}
          pagination={{
            current: this.pages.pageIndex,
            pageSize: this.pages.pageSize,
            total: this.pages.pageCount,
          }}
          onChange={(pagination) => {
            this.pages.pageIndex = pagination.current;
            this.getData();
          }}
        />
      </div>
    );
  }
}

export default QueryList;

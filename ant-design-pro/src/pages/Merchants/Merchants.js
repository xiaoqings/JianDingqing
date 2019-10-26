import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Table, Card, Form, Input, Divider, Modal, Button, DatePicker, message, Radio, Select, Row, Col } from 'antd';
import { getDateString } from '../../utils/utils';

const Search = Input.Search;

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Option = Select.Option;

const dateFormat = 'YYYY-MM-DD';

@connect(({ list, user, loading }) => ({
  list,
  currentUser: user.currentUser,
  loading: loading.effects['list/fetchBusinessList'],
  isSubmit: loading.effects['user/saveSetting'],
}))
@Form.create()
export default class Merchants extends PureComponent {
  constructor() {
    super();

    this.state = {
      defaultType : 1,
      startDate : 1,
      endDate : 10,
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
        title: '未核销的消费点数',
        dataIndex: 'totalConsumptionShoppingSpot',
        width : '100px',
        render: (text, record) => {
          return (
            <div>
              {text}
              <Divider type="vertical" />
              <a onClick={() => {
                this.setState({visible:true,type : 1,infoCode :record.businessCode})
              }} >详情</a>
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
        title: '核销时间',
        width : '200px',
        render: (text, record) => {
          let type = record.setType || 1;
          let start = record.startDate || '无';
          let end = record.endDate || '无';
          let result = <a >{start} 至 {end}</a>;
          if(type === 1){
            start = record.startDate || 1;
            end = record.endDate || 1;
            result = <a >{`每月${start}号-${end}号`}</a>;
          }
          return (<Fragment>{result}</Fragment>);
        },
      },
      {
        title: '操作',
        dataIndex: 'confirmHx',
        width : '200px',
        render: (text, record) => {
          let type = record.setType || 1;
          let start = record.startDate || new Date;
          let end = record.endDate || new Date;
          if(type === 1){
            start = record.startDate || 1;
            end = record.endDate || 1;
          }
          return (
            <Fragment>
              <div><a onClick={() => this.setState({visible:true, type : 2,infoCode :record.businessCode })}>核销记录</a></div>
              <div>
                <a onClick={() => {
                  this.setState({
                    showTimeModal:true,
                    infoCode :record.businessCode,
                    info:record,
                    defaultType : type,
                    startDate : start ,
                    endDate : end,
                  })
                }} >核销设置</a>
              </div>
              <div>
                {text ? <a onClick={() => this.confirmHeXiao(record)} >{'确认核销'}</a> : null}
              </div>
            </Fragment>
          );
        },
      },
    ];
  }

  componentWillReceiveProps(nextProps) {
    const {
      list: { page },
      isSubmit
    } = nextProps;
    if (page) {
      this.pages.pageIndex = page.pageIndex || 1;
      this.pages.pageSize = page.pageSize || 1;
      this.pages.pageCount = page.totalCount || 1;
    }
    if(isSubmit){
      this.setState({showTimeModal : false});
      this.getData();
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
      pageIndex: this.pages.pageIndex,
      pageSize: this.pages.pageSize,
      queryParam: this.state.searchValue || '',
    };
    dispatch({
      type: 'list/fetchBusinessList',
      payload: params,
    });
  };

  // todo 是否确认核销
  confirmHeXiao = (info) => {
    const { dispatch} = this.props;
    Modal.confirm({
      title: '【微睐美】确认核销',
      content: `您确定要核销 【${info.businessName}】 消费点吗?`,
      okText : '确认核销',
      cancelText : '取消',
      onCancel : () => { return false},
      onOk : () => {
        dispatch({
          type: 'user/confirmHeXiao',
          payload: {
            bdiCode : info.businessCode,
          },
        });

        setTimeout(() => {
          this.getData()
        },3000);
      }
    });
  };

  // todo  保存时间设置
  _saveSetting = () => {
    const { dispatch } = this.props;
    const {defaultType,startDate,endDate,infoCode} = this.state;
    if(defaultType === 1 ){
      if(startDate > endDate){
        return message.warn('开始日期不能大于结束日期!');
      }
    }else {
      if(new Date(startDate).getTime() > new Date(endDate).getTime()){
        return message.warn('开始日期不能大于结束日期!');
      }
    }

    const params = {
      setType : defaultType,
      bdiCode : infoCode,
      startDate,
      endDate,
    };
    dispatch({
      type: 'user/saveSetting',
      payload: params,
    });
  };

  render() {
    const {
      list: { list },
      loading = false,
      isSubmit = false
    } = this.props;

    const { searchValue, type = 1,infoCode = null, info = null} = this.state;

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
            defaultValue={searchValue || ''}
            placeholder={'搜索名称/联系人/电话号码'}
            enterButton="搜索"
            onSearch={(value) => {
              this.pages.pageIndex = 1;
              this.setState({ searchValue: value }, () => this.getData());
            }}
          />
        </div>

        <Table
          loading={loading}
          dataSource={list}
          scroll={{x:true}}
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
          title={type === 1 ? '未核销的消费点列表' : '核销记录'}
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

        <Modal
          width={'80%'}
          title={`设置【${info ? info.businessName : '-'}】商家核销时间`}
          visible={this.state.showTimeModal || false}
          maskClosable={false}
          onCancel={() => this.setState({showTimeModal:false})}
          footer={[
            <Button key="back" type={'primary'} onClick={isSubmit ? () => {} : () => this._saveSetting()}>
              {isSubmit ? '保存中..' : '保存设置'}
            </Button>,
            <Button key="back" onClick={() => this.setState({showTimeModal:false})}>{'关闭'}</Button>,
          ]}
        >
          <RadioGroup
            onChange={(e) =>  {
              let num = parseInt(e.target.value);
              let obj = {defaultType:num};
              if(num === 1){
                obj.startDate = 1;
                obj.endDate = 10;
              }else {
                obj.startDate = new Date();
                obj.endDate = new Date();
              }
              this.setState({...obj})
            }}
            value={this.state.defaultType}
          >
            <RadioButton value={1}>按月</RadioButton>
            <RadioButton value={2}>自定义</RadioButton>
          </RadioGroup>
          {this.getRender()}
        </Modal>

      </Card>
    );
  }

  getRender = () => {
    const {defaultType,startDate,endDate} = this.state;
    let result = null;
    switch (defaultType) {
      case 1:
        let arr = [];
        for(let i = 1; i <= 31; i++){
          arr.push(i)
        }
        result = (
          <Row gutter={6} >
            <Col xs={24} md={10} style={{marginTop:10}}>
              {'开始时间 : '}
              <Select
                value={startDate}
                placeholder={'请选择核销的开始日期'}
                style={{width:'100%'}}
                onChange={(value) => this.setState({startDate:parseInt(value)})}>
                {arr.map((val,i) => (<Option key={i} value={val}>{`${val}号`}</Option>))}
              </Select>
            </Col>
            <Col xs={24} md={10} style={{marginTop:10}} >
              {'结束时间 : '}
              <Select
                value={endDate}
                placeholder={'请选择核销的结束日期'}
                style={{width:'100%'}}
                onChange={(value) => this.setState({endDate:parseInt(value)})}>
                {arr.map((val,i) => (<Option key={i} value={val}>{`${val}号`}</Option>))}
              </Select>
            </Col>
          </Row>

        );
        break;
      case 2:
        result = (
          <Row gutter={6} >
            <Col xs={24} md={10} style={{marginTop:10}}>
              {'开始日期 : '}
              <DatePicker
                value={moment(startDate,dateFormat)}
                onChange={(date, dateString) => this.setState({ startDate: dateString})}
              />
            </Col>
            <Col xs={24} md={10} style={{marginTop:10}} >
              {'结束日期 : '}
              <DatePicker
                value={moment(endDate,dateFormat)}
                onChange={(date, dateString) => this.setState({ endDate: dateString})}
              />
            </Col>
          </Row>
        );
        break;

    }
    return result;
  }
}


@connect(({ user, loading }) => ({
  list : user,
  loading: loading.effects['user/sscByCondition'],
  loadings: loading.effects['user/alreadyWriteoff'],
}))
export class WaitDoneTable extends PureComponent{
  constructor(){
    super();

    let date = new Date();
    this.state = {
      startDate: getDateString(),
      endDate: getDateString(`${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`),

      businessType : 1,
    };

    this.pages = {
      pageIndex: 1,
      pageSize: 5,
      pageCount: 0,
    };

  }

  componentWillReceiveProps(nextProps) {
    this.props = nextProps;
    const { list: { page }, businessType} = nextProps;
    if (page) {
      this.pages.pageIndex = page.pageIndex || 1;
      this.pages.pageSize = page.pageSize || 1;
      this.pages.pageCount = page.totalCount || 1;
    }
    if(businessType !== this.state.businessType){
      this.setState({businessType});
      this.getData();
    }
  }

  componentDidMount() {
    const { list: { page }, businessType} = this.props;
    this.setState({businessType});
    if (page) {
      this.pages.pageIndex = page.pageIndex || 1;
      this.pages.pageSize = page.pageSize || 1;
      this.pages.pageCount = page.totalCount || 1;
    }

    this.getData();
  }

  // todo 顾客消费点【未核销】消费列表【总经销可看和分销商可看】
  getData = () => {
    const { dispatch,businessCode,businessType } = this.props;
    if(!businessCode){return message.error('商户信息参数错误!')}
    const params = {
      bdiCode : businessCode,
      pageIndex : this.pages.pageIndex,
      pageSize : this.pages.pageSize,
    };

    // 详情
    if(parseInt(businessType) === 1){
      dispatch({
        type: 'user/sscByCondition',
        payload: {
          ...params,
          isWriteOff : 2
        },
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
      loadings = false,
      businessType,
    } = this.props;
    let columns = [
      {
        title: '编号',
        dataIndex: 'consumptionId',
      },{
        title: '客户电话',
        dataIndex: 'customerPhone',
      },{
        title: '兑换消费点数',
        dataIndex: 'consumptionShoppingSpot',
      },{
        title: '剩余消费点数',
        dataIndex: 'surplusConsumption',
      },{
        title: '兑换时间',
        dataIndex: 'consumptionShoppingSpotTime',
      },
    ];
    return(
      <div>
        <h2 style={{textAlign:'center'}} >
          {(businessType && parseInt(businessType) === 1) ? '未核销的消费点列表': '核销记录'}
        </h2>
        <Table
          loading={loading || loadings}
          dataSource={list.sscList || []}
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

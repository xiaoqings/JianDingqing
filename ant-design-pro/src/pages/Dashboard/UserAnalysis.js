import React, { PureComponent, Suspense } from 'react';
import { connect } from 'dva';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import { getTimeDistance } from '@/utils/utils';
import { AsyncLoadBizCharts } from '@/components/Charts/AsyncLoadBizCharts';
import styles from './Analysis.less';
import { Card, Table } from 'antd';

const SalesCard = React.lazy(() => import('./SalesCard'));

@connect(({user, loading }) => ({
  list : user,
  currentUser: user.currentUser,
  loading: loading.effects['user/fetchList'],
}))

class Analysis extends PureComponent {
  constructor(){
    super();

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
    const { list: { page }, } = nextProps;
    if (page) {
      this.pages.pageIndex = page.pageIndex || 1;
      this.pages.pageSize = page.pageSize || 1;
      this.pages.pageCount = page.totalCount || 1;
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

  componentWillUnmount() {
    cancelAnimationFrame(this.reqRef);
    clearTimeout(this.timeoutId);
  }

  getData = () => {
    const { dispatch,currentUser } = this.props;
    this.reqRef = requestAnimationFrame(() => {
      const params = {
        pageIndex: this.pages.pageIndex,
        pageSize: this.pages.pageSize,
        businessCode : currentUser.userid,
      };
      dispatch({
        type: 'user/fetchList',
        payload: params,
      });
    });
  };

  render() {
    const { list : {list}, loading } = this.props;
    const salesData = [];
    for (let i = 0; i < list.length; i ++) {
      const {customerPhone,consumptionShoppingSpot} = list[i];
      salesData.push({
        x: customerPhone || '-',
        y: consumptionShoppingSpot || 0,
      });
    }

    const columns = [
      {
        title: '编号',
        dataIndex: 'consumptionId',
        key: 'consumptionId',
      }, {
        title: '顾客电话',
        dataIndex: 'customerPhone',
        key: 'customerPhone',
      }, {
        title: '消费购物点',
        dataIndex: 'consumptionShoppingSpot',
        key: 'consumptionShoppingSpot',
      },
    ];

    return (
      <GridContent>
        <Suspense fallback={null}>
          <SalesCard
            salesData={salesData}
            loading={loading}
            title={'当月购物点兑换柱状图'}
          />
        </Suspense>
        <div className={styles.twoColLayout}>
          <Card
            loading={loading}
            bordered={false}
            title={'当月购物点兑换'}
            style={{ marginTop: 24 }}
          >
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
          </Card>
        </div>
      </GridContent>
    );
  }
}

export default props => (
  <AsyncLoadBizCharts>
    <Analysis {...props} />
  </AsyncLoadBizCharts>
);

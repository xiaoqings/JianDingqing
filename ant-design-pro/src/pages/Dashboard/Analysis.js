import React, { PureComponent, Suspense } from 'react';
import { connect } from 'dva';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import { getTimeDistance } from '@/utils/utils';
import styles from './Analysis.less';
import { AsyncLoadBizCharts } from '@/components/Charts/AsyncLoadBizCharts';
import { Card, Table } from 'antd';

const SalesCard = React.lazy(() => import('./SalesCard'));

@connect(({ user, loading }) => ({
  list : user,
  loading: loading.effects['user/fetchHome'],
}))

class Analysis extends PureComponent {
  constructor(){
    super();

    this.pages = {
      pageIndex: 1,
      pageSize: 10,
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
    const { dispatch } = this.props;
    this.reqRef = requestAnimationFrame(() => {
      const params = {
        pageIndex: this.pages.pageIndex,
        pageSize: this.pages.pageSize,
      };
      dispatch({
        type: 'user/fetchHome',
        payload: params,
      });
    });
  };

  render() {
    const { list : {list}, loading } = this.props;

    const salesData = [];
    for (let i = 0; i < list.length; i ++) {
      const {businessName,exchangeShoppingSpot} = list[i];
      salesData.push({
        x: `${businessName || '-'}`,
        y: exchangeShoppingSpot || 0,
      });
    }

    const searchData = [];
    for (let i = 0; i < list.length; i ++) {
      const {businessName,exchangeShoppingSpot} = list[i];
      searchData.push({
        index: i + 1,
        keyword: businessName,
        count: exchangeShoppingSpot,
      });
    }

    const columns = [
      {
        title: '排名',
        dataIndex: 'index',
        key: 'index',
      }, {
        title: '店铺名称',
        dataIndex: 'keyword',
        key: 'keyword',
        render: text => <a href="/">{text}</a>,
      }, {
        title: '兑换购物点数',
        dataIndex: 'count',
        key: 'count',
        className: styles.alignRight,
      },
    ];

    return (
      <GridContent>
        <Suspense fallback={null}>
          <SalesCard
            salesData={salesData}
            loading={loading}
            title={'门店当月购物点兑换柱状图'}
          />
        </Suspense>
        <div className={styles.twoColLayout}>
          <Card
            loading={loading}
            bordered={false}
            title={'门店当月购物点兑换'}
            style={{ marginTop: 24 }}
          >
            <Table
              loading={loading}
              dataSource={searchData}
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

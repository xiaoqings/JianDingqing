import React, { PureComponent, Suspense } from 'react';
import { connect } from 'dva';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import { getTimeDistance } from '@/utils/utils';
import { AsyncLoadBizCharts } from '@/components/Charts/AsyncLoadBizCharts';

const SalesCard = React.lazy(() => import('./SalesCard'));

@connect(({ chart, user, loading }) => ({
  chart,
  list : user,
  loading: loading.effects['user/fetchList'],
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
    return (
      <GridContent>
        <Suspense fallback={null}>
          <SalesCard
            salesData={salesData}
            loading={loading}
          />
        </Suspense>
      </GridContent>
    );
  }
}

export default props => (
  <AsyncLoadBizCharts>
    <Analysis {...props} />
  </AsyncLoadBizCharts>
);

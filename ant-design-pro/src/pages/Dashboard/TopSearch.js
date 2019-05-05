import React, { memo } from 'react';
import { Table, Card } from 'antd';
import { FormattedMessage } from 'umi/locale';
import styles from './Analysis.less';
import { MiniArea } from '@/components/Charts';

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
    title: '兑换消费点数',
    dataIndex: 'count',
    key: 'count',
    className: styles.alignRight,
  },
];

const TopSearch = memo(({ loading, searchData }) => (
  <Card
    loading={loading}
    bordered={false}
    title={'门店当月消费点兑换'}
    style={{ marginTop: 24 }}
  >
    <Table
      rowKey={record => record.index}
      size="small"
      columns={columns}
      dataSource={searchData}
      pagination={{
        style: { marginBottom: 0 },
        pageSize: 10,
      }}
    />
  </Card>
));

export default TopSearch;

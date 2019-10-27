import React, { memo } from 'react';
import { Card, Tabs } from 'antd';
import { FormattedMessage, formatMessage } from 'umi/locale';
import styles from './Analysis.less';
import { Bar } from '@/components/Charts';

const { TabPane } = Tabs;

const SalesCard = memo(
  ({ salesData, handleRangePickerChange, loading ,title}) => (
    <Card loading={loading} bordered={false} bodyStyle={{ padding: 0 }}>
      <div className={styles.salesCard}>
        <Tabs size="large" tabBarStyle={{ marginBottom: 24 }}>
          <TabPane tab={title} key="sales">
            <div className={styles.salesBar}>
              <Bar
                height={400}
                title={''}
                data={salesData} />
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Card>
  )
);

export default SalesCard;

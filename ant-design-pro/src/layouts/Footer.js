import React, { Fragment } from 'react';
import { Layout, Icon } from 'antd';
import GlobalFooter from '@/components/GlobalFooter';

const { Footer } = Layout;
const FooterView = () => (
  <Footer style={{ padding: 0 }}>
    <GlobalFooter
      links={
        [
          // {
          //   key: 'Pro 首页',
          //   title: 'Pro 首页',
          //   href: 'https://pro.ant.design',
          //   blankTarget: true,
          // },
        ]
      }
      copyright={
        <Fragment>
          Copyright <Icon type="copyright" /> 2019年03月20日
        </Fragment>
      }
    />
  </Footer>
);
export default FooterView;

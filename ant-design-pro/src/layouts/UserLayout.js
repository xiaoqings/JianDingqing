import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import { Divider, Icon } from 'antd';
import DocumentTitle from 'react-document-title';
import GlobalFooter from '../components/GlobalFooter';
import styles from './UserLayout.less';
import logo from '../assets/logo.svg';
import getPageTitle from '../utils/getPageTitle';

const copyright = (
  <Fragment>
    Copyright <Icon type="copyright" /> 微睐美商城所有
    {/*<span className="query_list">*/}
      {/*<Divider type="vertical" />*/}
      {/*<Link to="/user/query">*/}
        {/*{'自助查询'}*/}
      {/*</Link>*/}
    {/*</span>*/}
  </Fragment>
);

class UserLayout extends Component {
  componentDidMount() {
    const {
      dispatch,
      route: { routes, authority },
    } = this.props;
    dispatch({
      type: 'menu/getMenuData',
      payload: { routes, authority },
    });
  }

  render() {
    const {
      children,
      location: { pathname },
      breadcrumbNameMap,
    } = this.props;
    return (
      <DocumentTitle title={getPageTitle(pathname, breadcrumbNameMap)}>
        <div className={`${styles.container} query_padding`}>
          <div className={`${styles.content} query_padding`}>
            <div className={`${styles.top} query_list`}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.logo} src={logo} />
                  <span className={styles.title}>微睐美商城</span>
                </Link>
              </div>
              <div className={styles.desc}> </div>
            </div>
            {children}
          </div>
          <GlobalFooter copyright={copyright} />
        </div>
      </DocumentTitle>
    );
  }
}

export default connect(({ menu: menuModel }) => ({
  menuData: menuModel.menuData,
  breadcrumbNameMap: menuModel.breadcrumbNameMap,
}))(UserLayout);

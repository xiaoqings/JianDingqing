import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import Link from 'umi/link';
import {Icon } from 'antd';
import DocumentTitle from 'react-document-title';
import GlobalFooter from '../components/GlobalFooter';
import styles from './UserLayout.less';
import logo from '../assets/logo_1.png';
import header from '../assets/header.png';
import getPageTitle from '../utils/getPageTitle';

const copyright = (
  <Fragment>
    <div style={{position:'absolute',bottom:15, left:'45%'}}>
      Copyright <Icon type="copyright" /> 微睐美商城所有
    </div>
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

          {/* <div className={styles.login_header}> */}
          {/* <img alt="logo" className={styles.login_header_img} src={header} style={{width:512,height:'auto',marginLeft:'5%'}} /> */}
          <div className={`${styles.content} query_padding`}>
            <div className={`${styles.top} query_list`}>
              <div className={styles.header}>
                <Link to="/">
                  <img alt="logo" className={styles.logo} src={logo} style={{height:70}} />
                </Link>
              </div>
              <div className={styles.desc}> </div>
            </div>
            {children}
          </div>
          {/* </div> */}

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

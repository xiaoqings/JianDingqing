import React, { PureComponent } from 'react';
import { connect } from 'dva';
import router from 'umi/router';
import { Card, Row, Col, Icon, } from 'antd';
import GridContent from '@/components/PageHeaderWrapper/GridContent';
import styles from './Center.less';

@connect(({ loading, user, project }) => ({
  currentUser: user.currentUser,
  listLoading: loading.effects['list/fetch'],
  currentUserLoading: loading.effects['user/fetchCurrent'],
  projectLoading: loading.effects['project/fetchNotice'],
  project,
}))
export default class Center extends PureComponent {
  constructor(){
    super();

    this.state = {

    };
  }

  componentWillReceiveProps(nextProps){
    this.props = nextProps;
  }

  componentDidMount() {
    this.getData();
  }

  // todo 数据请求
  getData = () => {
    const { dispatch } = this.props;
    // todo 获取当前登录用户信息
    dispatch({
      type: 'user/fetchCurrent',
    });
  };

  onTabChange = key => {
    const { match } = this.props;
    switch (key) {
      case 'articles':
        router.push(`${match.url}/articles`);
        break;
      case 'applications':
        router.push(`${match.url}/applications`);
        break;
      case 'projects':
        router.push(`${match.url}/projects`);
        break;
      default:
        break;
    }
  };


  render() {
    const {
      currentUserLoading,
      listLoading,
      currentUser,
      match,
      location,
      children,
    } = this.props;

    const operationTabList = [
      {
        key: 'articles',
        tab: (
          <span>
            顾客消费点消费列表 <span style={{ fontSize: 14 }}>(8)</span>
          </span>
        ),
      }, {
        key: 'projects',
        tab: (
          <span>
            {' '}
            消费点消费记录 <span style={{ fontSize: 14 }}>(8)</span>
          </span>
        ),
      }, {
        key: 'applications',
        tab: (
          <span>
            核销记录 <span style={{ fontSize: 14 }}>(8)</span>
          </span>
        ),
      },
    ];

    return (
      <GridContent className={styles.userCenter}>

        <Row gutter={24}>
          <Col xs={24} md={24}>
            <Card bordered={false} style={{ marginBottom: 24 }} loading={currentUserLoading}>
              {currentUser && Object.keys(currentUser).length ? (
                <div>
                  <div className={styles.avatarHolder}>
                    <img alt={'头像'} src={currentUser.avatar} />
                    <div className={styles.name}>{currentUser.name}</div>
                  </div>
                  <div className={styles.detail}>
                    <p><Icon type="user"/> {currentUser.contact || '无'}</p>
                    <p><Icon type="mail"/> {currentUser.email || '无'}</p>
                    <p><Icon type="phone"/> {currentUser.phone || '无'}</p>
                    <p><Icon type="environment" /> {currentUser.address || '无'} </p>
                  </div>
                </div>
              ) : ('加载中...')
              }
            </Card>
          </Col>
          {/*<Col lg={17} md={24}>*/}
            {/*<Card*/}
              {/*className={styles.tabsCard}*/}
              {/*bordered={false}*/}
              {/*tabList={operationTabList}*/}
              {/*activeTabKey={location.pathname.replace(`${match.path}/`, '')}*/}
              {/*onTabChange={this.onTabChange}*/}
              {/*loading={listLoading}*/}
            {/*>*/}
              {/*{children}*/}
            {/*</Card>*/}
          {/*</Col>*/}
        </Row>
      </GridContent>
    );
  }
}


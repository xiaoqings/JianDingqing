import React from 'react';
import { formatMessage } from 'umi/locale';
import Link from 'umi/link';
import Exception from '@/components/Exception';
import { connect } from 'dva';

@connect(({user }) => ({
  currentUser: user.currentUser,
}))
class Exception403 extends React.Component{

  constructor(){
    super();

    this.timer = true;
  }

  componentWillReceiveProps(nextProps){
    this.props = nextProps;
  }

  render(){

    const {currentUser}  = this.props;
    console.log('currentUser ==> ',currentUser,this.timer);
    if(currentUser && currentUser.type === 'admin' && this.timer){
      window.location.href = '/dashboard';
      this.timer = null;
    }

    return null;

    // return(
    //   <Exception
    //     type="403"
    //     desc={formatMessage({ id: 'app.exception.description.403' })}
    //     linkElement={Link}
    //     backText={formatMessage({ id: 'app.exception.back' })}
    //   />
    // )
  }

}

export default Exception403;

import React, { Component, Fragment } from 'react';
import { Form, Input, Upload, Select, Button } from 'antd';
import { connect } from 'dva';
import styles from './BaseView.less';
import GeographicView from './GeographicView';
import PhoneView from './PhoneView';

const FormItem = Form.Item;
const { Option } = Select;

// 头像组件 方便以后独立，增加裁剪之类的功能
const AvatarView = ({ avatar }) => (
  <Fragment>
    <div className={styles.avatar_title}>{'头像'}</div>
    <div className={styles.avatar}>
      <img src={avatar} alt="avatar" />
    </div>
    <Upload fileList={[]}>
      <div className={styles.button_view}>
        <Button icon="upload">{'上传头像'}</Button>
      </div>
    </Upload>
  </Fragment>
);

const validatorGeographic = (rule, value, callback) => {
  const { province, city } = value;
  if (!province.key) {
    callback('请选择省份!');
  }
  if (!city.key) {
    callback('请选择你在的城市!');
  }
  callback();
};

const validatorPhone = (rule, value, callback) => {
  const values = value.split('-');
  if (!values[0]) {
    callback('请输入你的电话!');
  }
  if (!values[1]) {
    callback('请输入你的手机号!');
  }
  callback();
};

@connect(({ user }) => ({
  currentUser: user.currentUser,
}))
@Form.create()
class BaseView extends Component {
  componentDidMount() {
    this.setBaseInfo();
  }

  setBaseInfo = () => {
    const { currentUser, form } = this.props;
    Object.keys(form.getFieldsValue()).forEach(key => {
      const obj = {};
      obj[key] = currentUser[key] || null;
      form.setFieldsValue(obj);
    });
  };

  getAvatarURL() {
    const { currentUser } = this.props;
    if (currentUser.avatar) {
      return currentUser.avatar;
    }
    const url = 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png';
    return url;
  }

  getViewDom = ref => {
    this.view = ref;
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div className={styles.baseView} ref={this.getViewDom}>
        <div className={styles.left}>
          <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
            <FormItem label={'邮箱'}>
              {getFieldDecorator('email', {
                rules: [
                  {
                    required: true,
                    message: '请输入您的邮箱!',
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem label={'店铺名称'}>
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: '请输入你的店铺名称!',
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem label={'店铺简介'}>
              {getFieldDecorator('profile', {
                rules: [
                  {
                    required: true,
                    message: '请输入你的店铺简介',
                  },
                ],
              })(<Input.TextArea placeholder={'店铺简介'} rows={4} />)}
            </FormItem>
            <FormItem label={'国家/地区'}>
              {getFieldDecorator('country', {
                rules: [
                  {
                    required: true,
                    message: '请选择你所在的国家',
                  },
                ],
              })(
                <Select style={{ maxWidth: 220 }}>
                  <Option value="China">中国</Option>
                </Select>
              )}
            </FormItem>
            <FormItem label={'所在省市'}>
              {getFieldDecorator('geographic', {
                rules: [
                  {
                    required: true,
                    message: '请选择你所在的省市',
                  },
                  {
                    validator: validatorGeographic,
                  },
                ],
              })(<GeographicView />)}
            </FormItem>
            <FormItem label={'街道地址'}>
              {getFieldDecorator('address', {
                rules: [
                  {
                    required: true,
                    message: '请输入您的街道地址',
                  },
                ],
              })(<Input placehoder={'街道地址'} />)}
            </FormItem>
            <FormItem label={'联系人'}>
              {getFieldDecorator('contact', {
                rules: [
                  {
                    required: true,
                    message: '请输入店铺联系人',
                  },
                ],
              })(<Input placehoder={'店铺联系人'} />)}
            </FormItem>
            <FormItem label={'联系电话'}>
              {getFieldDecorator('phone', {
                rules: [
                  {
                    required: true,
                    message: '请输入您的联系电话!',
                  },
                  { validator: validatorPhone },
                ],
              })(<PhoneView />)}
            </FormItem>
            <Button type="primary">{'更新基本信息'}</Button>
          </Form>
        </div>
        <div className={styles.right}>
          <AvatarView avatar={this.getAvatarURL()} />
        </div>
      </div>
    );
  }
}

export default BaseView;

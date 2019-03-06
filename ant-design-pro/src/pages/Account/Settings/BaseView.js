import React, { Component } from 'react';
import { Form, Input, Upload,  Button, Icon ,message} from 'antd';
import { connect } from 'dva';
import styles from './BaseView.less';

const FormItem = Form.Item;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

@connect(({ user ,loading }) => ({
  currentUser: user.currentUser,
  submitting : loading.effects['user/updateUserInfo'],
}))
@Form.create()

class BaseView extends Component {

  constructor(){
    super();

    this.state = {

    };
  }

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

  handleSubmit = e => {
    e.preventDefault();
    const { form, dispatch } = this.props;
    form.validateFields({ force: true }, (err, values) => {
      if (!err) {
        dispatch({
          type: 'user/updateUserInfo',
          payload: { ...values},
        });
      }
    });
  };

  handleChange = ({file}) => {
    const { dispatch } = this.props;
    if (file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (file.status === 'done') {
      let KB = (file.size / 1024);
      const isLt2M = KB < 400;
      if (!isLt2M) {
        return message.error('上传图片太大, 上传图片最大为 500KB!');
      }
      getBase64(file.originFileObj,
        (imageUrl) => {
          dispatch({
            type: 'user/updateAvatar',
            payload: {
              filePath : imageUrl
            },
          });
          this.setState({
            imageUrl,
            loading: false,
          });
        }
      );
    }
  };

  render() {
    const {
      form: { getFieldDecorator },
      submitting
    } = this.props;

    const {
      loading = false,
      imageUrl = this.getAvatarURL()
    } = this.state;

    const uploadButton = (
      <div>
        <Icon type={loading ? 'loading' : 'plus'} />
        <div className="ant-upload-text">{'上传头像'}</div>
      </div>
    );
    return (
      <div className={styles.baseView} ref={this.getViewDom}>
        <div className={styles.left}>
          <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
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
                  }
                ],
              })(<Input placehoder={'联系电话'} />)}
            </FormItem>
            <FormItem label={'地址'}>
              {getFieldDecorator('address', {
                rules: [
                  {
                    required: true,
                    message: '请输入您的街道地址',
                  },
                ],
              })(<Input placehoder={'地址详情'} />)}
            </FormItem>
            <Button type="primary" loading={submitting} htmlType="submit">{'更新基本信息'}</Button>
          </Form>
        </div>
        <div className={styles.right}>
          <Upload
            name="avatar"
            listType="picture-card"
            className="avatar-uploader"
            showUploadList={false}
            onChange={this.handleChange}
          >
            {imageUrl ? <img src={imageUrl} alt="avatar"  style={{width:'100px'}}  /> : uploadButton}
          </Upload>
        </div>
      </div>
    );
  }
}

export default BaseView;

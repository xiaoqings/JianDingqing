import React, { PureComponent } from 'react';
import { List, Card } from 'antd';
import moment from 'moment';
import { connect } from 'dva';
import AvatarList from '@/components/AvatarList';
import stylesProjects from '../../List/Projects.less';

@connect(({ list }) => ({
  list,
}))
class Center extends PureComponent {
  render() {
    const {
      list: { list },
    } = this.props;
    return (
      <List
        className={stylesProjects.coverCardList}
        rowKey="id"
        grid={{ gutter: 24, xxl: 3, xl: 2, lg: 2, md: 2, sm: 2, xs: 1 }}
        dataSource={list}
        renderItem={item => (
          <List.Item>
            <Card
              className={stylesProjects.card}
              hoverable
              cover={<img alt={item.title} src={item.cover} />}
            >
              <Card.Meta title={<a>{item.title}</a>} description={item.subDescription} />
              <div className={stylesProjects.cardItemContent}>
                <span>{moment(item.updatedAt).fromNow()}</span>
                <div className={stylesProjects.avatarList}>
                  <AvatarList size="mini">
                    {item.members.map(member => (
                      <AvatarList.Item
                        key={`${item.id}-avatar-${member.id}`}
                        src={member.avatar}
                        tips={member.name}
                      />
                    ))}
                  </AvatarList>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    );
  }
}

export default Center;
//
// //谷歌坐标
// var x = 106.654635;
// var y = 26.618081;
// var point = new BMap.Point(x,y);
//
// var map = new BMap.Map("allmap");
// var geoc = new BMap.Geocoder();   //地址解析对象
// map.centerAndZoom(point, 16);
// map.addControl(new BMap.NavigationControl());
// map.enableScrollWheelZoom(true);
//
//
// //添加谷歌marker和label
// var markergg = new BMap.Marker(point);
// map.addOverlay(markergg); //添加谷歌marker
// var labelgg = new BMap.Label("我的位置）",{offset:new BMap.Size(20,-10)});
// markergg.setLabel(labelgg); //添加谷歌label
//
// geolocation.getCurrentPosition(function (r) {
//   if (this.getStatus() == BMAP_STATUS_SUCCESS) {
//     var mk = new BMap.Marker(r.point);
//     map.addOverlay(mk);
//     map.panTo(r.point);
//     map.enableScrollWheelZoom(true);
//   }
//   else {
//     alert('failed' + this.getStatus());
//   }
// }, {enableHighAccuracy: true})
// map.addEventListener("click", showInfo);
//
// //地图上标注
// function addMarker(point) {
//   var marker = new BMap.Marker(point);
//   markersArray.push(marker);
//   map.addOverlay(marker);
// }
// //点击地图时间处理
// function showInfo(e) {
//   document.getElementById('lng').value = e.point.lng;
//   document.getElementById('lat').value =  e.point.lat;
//
//   geoc.getLocation(e.point, function (rs) {
//     var addComp = rs.addressComponents;
//     var address = addComp.province + addComp.city + addComp.district + addComp.street + addComp.streetNumber;
//     console.log(address)
//     document.getElementById('address').value = address;
//   });
//   addOverlay(e.point);
// }
//
//
// var geolocation = new BMap.Geolocation();
// geolocation.getCurrentPosition(function(r){
//   if(this.getStatus() == BMAP_STATUS_SUCCESS){
//     var mk = new BMap.Marker(r.point);
//     map.addOverlay(mk);
//     map.panTo(r.point);
//     alert('您的位置：'+r.point.lng+','+r.point.lat);
//   }
//   else {
//     alert('failed'+this.getStatus());
//   }
// },{enableHighAccuracy: true})

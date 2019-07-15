<template>
 <!-- <div class="mapcontent" >
    <div class="leftsider" :class={active:isActive} >
      <layer-item :map="map" :layerChangeFromFather = "layerChange"></layer-item>
    </div>
    <div id ="allmap" class = "allmapstyle" :class={active:isActive} :style="{'height':getClientHeight}">
      <div id="map" ></div>
    </div>
  </div>-->
  <div id ="allmap" class = "allmapstyle" :class={active:isActive} :style="{'height':getClientHeight}">
    <div id="map" ></div>
  </div>
</template>

<script>
/* eslint-disable no-undef,semi */

/* import LayerItem from './LayerItems.vue' */
export default {
  props: ['isActive'],
  name: 'MapWindow',
  /* components: {LayerItem}, */
  data () {
    return {
      layerChange: false, // layerChange 更新子组件的地图
      map: null, // 图层
      test: 'test',
      drawTool: null,
      styleOptions: { // 绘制图形的式样
        strokeColor: 'red', // 边线颜色。
        fillColor: 'red', // 填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 2, // 边线的宽度，以像素为单位。
        strokeOpacity: 0.8, // 边线透明度，取值范围0 - 1。
        fillOpacity: 0.05, // 填充的透明度，取值范围0 - 1。
        strokeStyle: 'solid' // 边线的样式，solid或dashed。
      }
    }
  },
  created () {
    this.init()
    //
  },
  mounted () {
    console.log('map is mounted')
    this.initMap()
    this.layerChange = !this.layerChange // 子组件按数据生成覆盖物
    // console.log(this.map)
  },
  computed: {
    getClientHeight: function () {
      // 屏幕可视区域的高度
      let clientHeight = document.documentElement.clientHeight
      // 窗口可视区域发生变化的时候执行
      window.onresize = () => {
        clientHeight = document.documentElement.clientHeight
        return clientHeight
      }
      clientHeight = clientHeight - 100
      return clientHeight + 'px'
    }
  },
  methods: {
    init: function () {
      // console.log("初始化百度地图脚本...");
      const AK = 'EPgo3ahLed1MOQlZDPg1fdl0DN7Pg07w'
      const BMapURL = 'https://api.map.baidu.com/api?v=2.0&ak=' + AK + '&s=1&callback=onBMapCallback'
      // var that = this
      return new Promise((resolve, reject) => {
        // 如果已加载直接返回
        if (typeof BMap !== 'undefined') {
          resolve(BMap);
          return true;
        }
        // 百度地图异步加载回调处理
        window.onBMapCallback = function () {
          console.log('百度地图脚本初始化成功...');
          resolve(BMap);
          // that.loadBMapScript()
          // that.initMap()
        };

        // 插入script脚本
        let scriptNode = document.createElement('script');
        scriptNode.setAttribute('type', 'text/javascript');
        scriptNode.setAttribute('src', BMapURL);
        document.body.appendChild(scriptNode);
      });
    },
    initMap () {
      var map = new window.BMap.Map('allmap', {enableMapClick: false})
      window.map = map
      // this.map = map
      // var poi = new BMap.Point(116.307852, 40.057031)
      // map.centerAndZoom(poi, 16)
      var point = new window.BMap.Point(116.404, 39.915)
      map.centerAndZoom(point, 15)
      // var marker = new BMap.Marker(new BMap.Point(116.404, 39.915)) // 创建点
      var polygon = new window.BMap.Polygon([
        new window.BMap.Point(116.387112, 39.920977),
        new window.BMap.Point(116.385243, 39.913063),
        new window.BMap.Point(116.394226, 39.917988),
        new window.BMap.Point(116.401772, 39.921364),
        new window.BMap.Point(116.41248, 39.927893)
      ], {strokeColor: 'blue', strokeWeight: 2, strokeOpacity: 0.5}) // 创建多边形
      map.addOverlay(polygon) // 增加多边形
      polygon.addEventListener('click', function () {
        alert('this overlay is click')
      })
      map.enableScrollWheelZoom()
      console.log('map1 is mounted')
    },
    loadBMapScript () {
      console.log('start')
      let script1 = document.createElement('script');
      // script.src = 'http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js';
      script1.src = '../../../static/js/bmap/polygon.js';
      document.body.appendChild(script1);
      let script = document.createElement('script');
      // script.src = 'http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js';
      script.src = '../../../static/js/bmap/drawingManager.js';
      document.body.appendChild(script);
      let link = document.createElement('link');
      link.rel = 'stylesheet';
      // link.href = 'http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css';
      link.href = '../../../static/js/bmap/drawingManager.css'
      document.body.appendChild(link);
    },
    generateDrawTool () {
      var map = this.map
      if (this.drawTool == null) {
        var drawingManager = new window.BMapLib.DrawingManager(map, {
          isOpen: true, // 是否开启绘制模式
          enableDrawingTool: true, // 是否显示工具栏
          // drawingMode:BMAP_DRAWING_POLYGON,//绘制模式  多边形
          drawingToolOptions: {
            anchor: BMAP_ANCHOR_TOP_RIGHT, // 位置
            offset: new BMap.Size(20, 5), // 偏离值
            scale: 0.8, // 缩放
            drawingModes: [
              BMAP_DRAWING_MARKER,
              BMAP_DRAWING_POLYGON
            ]
          },
          circleOptions: this.styleOptions, // 圆的样式
          polylineOptions: this.styleOptions, // 线的样式
          polygonOptions: this.styleOptions, // 多边形的样式
          rectangleOptions: this.styleOptions // 矩形的样式
        })
        this.drawTool = drawingManager
      }
    }
  }
}
</script>

<style scoped>
  .allmapstyle{
    margin:3px 0 0;
    margin-left: 233px;
  }
  .allmapstyle.active {
    margin-left: 0px;
  }
  .leftsider{
    width: 230px;
    height: 100%;
    background: #ffffff;
    float: left;
  }
  .leftsider.active{
    width: 0px;
  }
  .mapcontent{
  }
</style>

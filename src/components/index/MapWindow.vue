<template>
  <div class="mapcontent">
    <div class="leftsider" :class={active:isActive}>
      <button @click = "generateDrawTool">test</button>
      <layer-item></layer-item>
    </div>
    <div id ="allmap" class = "allmapstyle" :class={active:isActive}>
      <div id="map" ></div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-undef,semi */

import LayerItem from './LayerItems.vue'
export default {
  props: ['isActive'],
  name: 'MapWindow',
  components: {LayerItem},
  data () {
    return {
      map: null, // 图层
      test: 'test',
      drawTool: null,
      styleOptions: { // 绘制图形的式样
        strokeColor: 'red', // 边线颜色。
        fillColor: 'red', // 填充颜色。当参数为空时，圆形将没有填充效果。
        strokeWeight: 2, // 边线的宽度，以像素为单位。
        strokeOpacity: 0.8, // 边线透明度，取值范围0 - 1。
        fillOpacity: 0.1, // 填充的透明度，取值范围0 - 1。
        strokeStyle: 'solid' // 边线的样式，solid或dashed。
      }
    }
  },
  created () {
    this.loadBMapScript()
  },
  mounted () {
    this.initMap()
  },
  methods: {
    initMap () {
      var map = new window.BMap.Map('allmap', {enableMapClick: false})
      var poi = new window.BMap.Point(116.307852, 40.057031)
      map.centerAndZoom(poi, 16)
      map.enableScrollWheelZoom()
      this.map = map
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
      console.log('t start')
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
        this.drawTool.removeEventListener('add')
        this.drawTool.addEventListener('overlaycomplete', this.overlaycomplete, 'add')
      }
    }
  }
}
</script>

<style scoped>
  .allmapstyle{
    margin:3px 0 0;
    height:900px;
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
    height:903px;
  }
</style>

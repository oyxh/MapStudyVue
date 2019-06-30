<template>
  <div >
    <div v-for="(layer,index) in this.layersget" :key="layer.layerId"  :style= "{height:'100%',display:'inline-block',
                   marginBottom:'5px',border: index === activeLayer ? '2px solid blue' : '2px solid #66b3FF'}"
         @click=selectLayer($event,layer.layerName,index) >
      <div class="layerstyle">
        <label>图层名称:{{layer.layerName}}- {{ index }}</label>
        <label >
          关闭编辑
        </label>
        <input  type="checkbox" value="checked" >
        <button type="success"  class="closeButton" @click=deleteLayer($event,layer.layerId,index)>&times;</button><br>
        <label>图层背景:{{layer.layerGround}}</label>
      </div>
       <div>
          <button type="success" class ="buttonLeft"  @click="value2 = true" >选择区域</button>
          <button type="success" class ="buttonRight">隐藏图层</button>
          <button type="success" class ="buttonRight" @click="drawLayer">图层绘制</button>
       </div>
      <div>
        <button type="success" class ="buttonLeft">导入数据</button>
        <button type="success" class ="buttonRight">清除图层</button>

        <button type="success" class ="buttonRight" @click="saveLayer">保存图层</button>

      </div>
    </div>
    <Drawer title="选择区域" placement="left" :closable="false"  width="200px" v-model="value2" @on-close="drawerClose">
      <Tree :data="data2" ref="tree" ></Tree>
    </Drawer>
  </div>
</template>

<script>
export default {
  name: 'SingleLayer',
  props: ['layerChange'],
  data: function () {
    return {
      layersget: [],
      activeLayer: 0,
      value2: false,
      data2: [
      ],
      map: null,
      drawTool: null
    }
  },
  mounted () {
    this.$emit('layerChangeFromSon')
    var that = this
    var postconfig = {
      method: 'get',
      url: 'api/districtlist'
    }
    this.axios(postconfig)
      .then(
        function (response) {
          console.log(response)
          that.data2 = response.data
          // that.initOverlays()// 初始化图层
        }
      )
      .catch(function (error) {
        console.log(error)
      })
  },
  computed: {
  },
  watch: {
    layerChange: function () {
      var that = this
      var postconfig = {
        method: 'get',
        url: 'api/layerlist'
      }
      this.axios(postconfig)
        .then(
          function (response) {
            console.log(response)
            that.layersget = response.data
            // that.initOverlays()// 初始化图层
          }
        )
        .catch(function (error) {
          console.log(error)
        })
    }
  },
  methods: {
    selectLayer (e, layerName, index) { // 选择图层
      this.activeLayer = index
    },
    deleteLayer (e, layerId, index) { // 删除图层
      this.confirm(layerId) // 确认是否删除
    },
    confirm (layerId, layerName) { // 确认是否删除
      var that = this
      this.$Modal.confirm({
        title: '请确认是否删除',
        content: '<p>删除后不可恢复，请注意！</p>',
        onOk: () => {
          this.$Message.info('删除图层')
          var postconfig = {
            method: 'post',
            url: 'api/removelayer',
            data: {
              id: layerId
            },
            transformRequest: [function (data) { // 登录时处理数据格式,处理后后台接收的参数为data按顺序传递
              let ret = ''
              for (let it in data) {
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
              }
              return ret
            }]
          }
          this.axios(postconfig)
            .then(
              function (response) {
                that.changeSuccess()
                console.log(response)
              })
            .catch(function (error) {
              console.log(error)
            }) // axios
        },
        onCancel: () => {
          // this.$Message.info('Clicked cancel')
        }
      })
    },
    changeSuccess () { // 图层变化
      this.$emit('layerChangeFromSon')
    },
    drawerClose: function () { // 选择背景地图的drawer关闭
      // console.log(this.activeLayer)
      // console.log(this.$refs.tree.getSelectedNodes()[0].title)
      if (this.$refs.tree.getSelectedNodes().length === 0) {
        this.$Message.info('没有选择背景图层')
      } else {
        var backcounty = this.$refs.tree.getSelectedNodes()[0].title
        if (backcounty !== this.layersget[this.activeLayer].layerGround) {
          var that = this
          this.$Modal.confirm({
            title: '背景变化',
            content: '即将更改背景区域，请确定',
            onOk: function () {
              that.setBackGroundLayer(backcounty)
            }
          })
        }
      }
    },
    setBackGroundLayer (backcounty) { // 设置背景图层
      this.layersget[this.activeLayer].layerGround = backcounty
      this.getBoundary(backcounty)
      // this.saveLayer(this.layersget[this.activeLayer])
    },
    getBoundary: function (backcounty) {
      var map = this.$parent.$parent.map
      var bdary = new window.BMap.Boundary()
      var layer = this.layersget[this.activeLayer]

      bdary.get(backcounty, function (rs) { // 获取行政区域
        // map.clearOverlays() // 清除地图覆盖物
        var count = rs.boundaries.length // 行政区域的点有多少个，行政区域的多边形可能有多个
        if (count === 0) {
          alert('未能获取当前输入行政区域')
          return
        }
        var pointArray = []
        for (var i = 0; i < count; i++) {
          var ply = new window.BMap.Polygon(rs.boundaries[i], {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8}) // 建立多边形覆盖物
          pointArray.push(ply.getPath())
        }
        var maxPointNum = 0
        var maxSeq = 0
        var formatGroundData = [] // 传送至后台的背景数据
        for (var j = 0; j < pointArray.length; j++) { // 简化行政区域的点
          if (pointArray[j].length > maxPointNum) {
            maxPointNum = pointArray[j].length
            maxSeq = j
          }
          var formatPolygon = { }
          formatPolygon.polygonName = backcounty + j
          formatPolygon.polygonMana = backcounty + j
          var pointArrayJson = []
          for (var k = 0; k < pointArray[j].length; k++) {
            pointArrayJson.push({
              'lng': pointArray[j][k].lng,
              'lat': pointArray[j][k].lat
            })
          }
          formatPolygon.polygonData = pointArrayJson
          formatGroundData.push(formatPolygon)
          var ply1 = new window.BMap.Polygon(pointArray[j], {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8})
          ply1.setFillOpacity(0.1)
          map.addOverlay(ply1)
        }
        console.log(pointArray.length)
        map.setViewport(pointArray[maxSeq])
        layer.layerGroundData = formatGroundData
        console.log(layer.layerGroundData)
        // that.saveLayer(layer)
        /* map.clearOverlays()
        var ply1 = new window.BMap.Polygon(pointArray, {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8})
        map.addOverlay(ply1)
        map.setViewport(pointArray) // 调整视野
        layer.layerGroundData = rs.boundaries */
      })
    },
    saveLayer: function () { // 保存图层  layer为数据，是layerget数组中的单元
      var layer = this.layersget[this.activeLayer]
      var that = this
      if (layer.layerData !== null) {
      } else {
        layer.layerData = []
        // layer.layerGroundData = [{polygonName: '', polygonMana: '', polygonData: [{lat: 130, lng: 120}]}]
      }
      var postconfig = {
        method: 'post',
        url: 'api/savelayer',
        dataType: 'json',
        data: layer,
        contentType: 'application/json'
      }
      this.axios(postconfig)
        .then(
          function (response) {
            that.$Message.info('保存成功')
            // that.layersget = response.data
            // that.initOverlays()// 初始化图层
          }
        )
        .catch(function (error) {
          console.log(error)
          that.$Message.info('保存未成功')
        })
    },
    drawLayer () { // 开始绘制区域图层
      this.generateDrawTool()
    },
    generateDrawTool () { // 生成绘制区域的工具
      this.$parent.$parent.generateDrawTool()
      this.drawTool = this.$parent.$parent.drawTool
      this.drawTool.removeEventListener('add')
      this.drawTool.addEventListener('overlaycomplete', this.overlaycomplete, 'add')
    },
    overlaycomplete (e) {
      var map = this.$parent.$parent.map
      var layer = this.layersget[this.activeLayer]
      var gridPoly = {
        polygonName: '',
        polygonMana: '',
        polygonData: []
      }
      gridPoly.polygonData = this.polyPathToJson(e.overlay.getPath())

      this.$Modal.confirm({
        title: '请输入网格信息：',
        // content: '<div><label>网格名称</label> <input v-model="value" placeholder="Enter something..."></input><br><br><label>网格经理</label> <input></input></div>',
        render: (h) => {
          const inputData = [{
            domProps: {
              value: gridPoly.polygonName,
              autofocus: true,
              placeholder: '请输入网格名字...',
              style: 'color:red;width:100%;margin-bottom:8px'
            },
            on: {
              input: (val) => {
                gridPoly.polygonName = val.target.value
              }
            }
          },
          {
            domProps: {
              value: gridPoly.polygonMana,
              autofocus: true,
              placeholder: '请输入网格负责人...',
              style: 'color:red;width:100%'
            },
            on: {
              input: (val) => {
                gridPoly.polygonMana = val.target.value
              }
            }
          }
          ]
          return h('div', inputData.map(item => h('input', item)))
        },
        onOk: function () {
          layer.layerData.push(gridPoly)
          alert(window.test())
          alert(gridPoly.polygonName)
          alert(gridPoly.polygonMana)
        },
        onCancel: function () {
          map.removeOverlay(e.overlay)
        }
      })
    },
    axiosRequest (type, url, data, resFuc, errerFuc) {
      var postconfig = {
        method: type,
        url: url,
        dataType: 'json',
        data: data,
        contentType: 'application/json'
      }
      this.axios(postconfig)
        .then(
          function (response) {
            console.log(response)
            resFuc()
          }
        )
        .catch(function (error) {
          console.log(error)
          errerFuc()
        })
    },
    polyPathToJson (pointArray) { // 多边形的path 变为json
      var pointArrayJson = []
      for (var k = 0; k < pointArray.length; k++) {
        pointArrayJson.push({
          'lng': pointArray[k].lng,
          'lat': pointArray[k].lat
        })
      }
      return pointArrayJson
    }
  }
}
</script>

<style scoped>
  .layerstyle{
    width:226px;
    display:inline-block;
    fontSize: 13px;
    height:38px;
    background:#D8D8D8;
    lineHeight:38px;
  /*  color:  #868E8E;
    textAlign:left;
    display:inline-block;*/
  }
  .buttonLeft{
    width:33.33%;
    float:left;
    border:2px solid #e3dbe2;
    background-color: #ffffff;
  }
  .buttonRight{
    width:33.33%;
    float:right;
    border:2px solid #e3dbe2;
    background-color: #ffffff;
  }
  .closeButton{
    float:right;
    height:16px;
    margin-right: 5px;
  }
  checkeButton{
    marginLeft:15px;
  }
</style>

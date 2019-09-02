<template>
  <div>
    <promp-window @sendName ="addLayer" ></promp-window>
    <br>
   <import-window :windowState="importData"></import-window>
    <br>
    <Drawer title="选择区域" placement="left" :closable="false"  width="200px" v-model="value2" @on-close="drawerClose">
      <Tree :data="data2" ref="tree" ></Tree>
    </Drawer>
    <div v-for="(layer,index) in this.layersget" :key="layer.layerId"  :style= "{height:'100%',display:'inline-block',marginBottom:'5px',border: index === activeLayer ? '2px solid blue' : '2px solid #66b3FF'}"
         @click=selectLayer($event,layer.layerId,index) >
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
        <button type="success" class ="buttonRight" @click = "countOverlays">隐藏图层</button>
        <button type="success" class ="buttonRight" @click="drawLayer">图层绘制</button>
      </div>
      <div>
        <button type="success" class ="buttonLeft" @click=importFromFile($event,layer.layerId,index)>导入数据</button>
        <button type="success" class ="buttonRight">清除图层</button>

        <button type="success" class ="buttonRight" @click=saveLayer($event,layer.layerId,index)>保存图层</button>

      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars,eqeqeq */
import PrompWindow from './promp'
import ImportWindow from './ImportWindow'
import Mask from '../../utils/Mask'
export default {
  name: 'LayerItems',
  components: {PrompWindow, ImportWindow},
  props: ['map', 'layerChangeFromFather'],
  computed: {
    layerChange: function () {
      return this.layerChangeFromFather
    }
  },
  /*
geometrys 数组，从数据库获取，该user的所有几何体的数据库存储信息
geometrysInLayer:所有几何体重新存储为，geometrysInLayer[layerId]为一个map，图层id为layerId的所有几何体都存储在此，geometrysInLayer[layerId].set(geometryId,geometry),将geometrys中的单位映射至该数据
页面所有操作都对geometrysInLayer进行
*/
  data: function () {
    return {
      activeLayer: 0,
      overlayMap: null,
      value2: false,
      layersget: [], // 所有图层
      geometrys: [], // 所有覆盖几何物体
      geometrysInLayer: { },
      data2: [],
      drawTool: null,
      importData: false,
      mask: null
      // layerChange: this.layerChangeFromFather
    }
  },
  created () {
    this.overlayMap = new Map()
  },
  mounted () {
    console.log('LayerItems is mounted')
    var that = this
    var postconfig = {
      method: 'get',
      url: 'api/districtlist'
    }
    this.axios(postconfig)
      .then(
        function (response) {
          that.data2 = response.data
        }
      )
      .catch(function (error) {
        console.log(error)
      })
    // this.layerIsChange()
  },
  watch: {
    layerChange: function () { // 同步获取数据库的图层信息
      console.log('layerChange')
      var that = this
      var postconfig = {
        method: 'get',
        url: 'api/layerlist'
      }
      var postconfig1 = {
        method: 'get',
        url: 'api/geometrylist'
      }
      this.axios.all([that.axiosRequest(postconfig), that.axiosRequest(postconfig1)])
        .then(this.axios.spread(function (acct, perms) {
          that.layersget = acct.data
          that.geometrys = perms.data
          that.initOverlays()// 初始化图层
        })).catch(error => {
          console.log(error)
        })
    }
  },
  methods: {
    axiosRequest (postconfig) { // 删除多个gemetry，批量删除
      return this.axios(postconfig)
    },
    initOverlays () {
      console.log('initOverlays')
      for (let layer in this.layersget) {
        this.geometrysInLayer[this.layersget[layer].layerId] = []
      }
      for (var i = 0; i < this.geometrys.length; i++) {
        var layerId = this.geometrys[i].layerId
        if (this.geometrysInLayer[layerId] === undefined) {
          this.geometrysInLayer[layerId] = []
        }
        this.geometrysInLayer[layerId].push(this.geometrys[i])
        // this.initOneGeometry(this.geometrysInLayer[layerId], this.geometrys[i])
      }
      this.mask = new Mask(this.map, this.geometrys, this.geometrysInLayer, this.overlayMap, this)
      if (this.layersget.length > 1) {
        this.mask.setFocus(this.layersget[0].layerId)
      }
    },
    dataSynch: function () { // 同步第layerseq层的数据
      this.overlayMap.forEach(function (value, key, map) {
        if (value._exist == 0) {
          map.delete(key)
        }
      })
    },
    synchDelete (geometrysId, geometrys) { // 同步页面上删除的数据
      for (let geometryId of geometrysId) {
        for (let index in geometrys) {
          if (geometryId == geometrys[index].geometryId) {
            this.overlayMap.delete(geometrys[index])
            geometrys.splice(index, 1)
          }
        }
      }
    },
    deleteGeometrys (geometrysId) { // 删除多个gemetry，批量删除
      var that = this
      var postconfig = {
        method: 'post',
        url: 'api/removegeometrys',
        dataType: 'json',
        data: geometrysId,
        contentType: 'application/json'
      }
      return this.axios(postconfig)
    },
    synchEdit (geometrys) { // 恢复编辑的区域为未编辑区
      for (let geometry of geometrys) {
        this.overlayMap.get(geometry)._isEdit = false
      }
    },
    editGeometrys (geometrys) { // 删除多个gemetry，批量删除
      var that = this
      var postconfig = {
        method: 'post',
        url: 'api/editgeometrys',
        dataType: 'json',
        data: geometrys,
        contentType: 'application/json'
      }
      return this.axios(postconfig)
    },
    saveLayer: function (e, layerId, index) { // 保存图层  layer为数据，是layerget数组中的单元
      console.log(this.overlayMap)
      var that = this
      var layer = this.layersget[this.activeLayer]
      var geometrys = this.geometrysInLayer[layerId] // 为map数据集合,key为geometyrId,value为geometry
      console.log(that.overlayMap)
      var deleteGeometrys = []
      var deleteGeometrysId = []
      var editGeometrys = []
      /*      geometrys.forEach(function (value, key, map) {
        if (that.overlayMap.get(value)._exist == 0) { // this.overlayMap为map数据集合,key为geometry,value为MyOverlay
          deleteGeometrysId.push(key)
        } else if (that.overlayMap.get(value)._isEdit) {
          editGeometrys.push(value)
        }
      }) */
      for (let index in geometrys) {
        if (that.overlayMap.get(geometrys[index])._exist == 0) { // this.overlayMap为map数据集合,key为geometry,value为MyOverlay
          deleteGeometrysId.push(geometrys[index].geometryId)
        } else if (that.overlayMap.get(geometrys[index])._isEdit) {
          editGeometrys.push(geometrys[index])
        }
      }
      this.axios.all([that.deleteGeometrys(deleteGeometrysId), that.editGeometrys(editGeometrys)])
        .then(this.axios.spread(function (acct, perms) {
          console.log(acct)
          console.log(perms)
          that.synchEdit(editGeometrys)
          that.synchDelete(deleteGeometrysId, geometrys)
          that.$Message.info('保存成功')
        })).catch(error => {
          that.$Message.info('保存未成功')
          console.log(error)
        })
    },
    countOverlays () {
      alert(this.map.getOverlays().length)
    },
    addLayer (gridName) {
      var that = this
      var postconfig = {
        method: 'post',
        url: 'api/addlayer',
        data: {
          layerName: gridName
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
            that.activeLayer = 0
            var layerId = response.data.msg
            that.addLayerInPage(gridName, layerId)
            // that.startDraw()
          })
        .catch(function (error) {
          console.log(error)
        }) // axios
    },
    addLayerInPage (gridName, layerId) { // 页面添加layer数据
      this.layersget.unshift({
        layerId: layerId,
        layerName: gridName
      })
      this.activeLayer = 0
      console.log(this.mask)
      if (this.mask !== undefined) {
        this.mask.setFocus(layerId)
      }
    },
    layerIsChange () { // 数据库的数据重载过来
      this.layerChange = !this.layerChange
    },
    drawLayersFromData () {
      var layer = this.layersget[this.activeLayer]
      this.drawLayerFromData(layer)
    },
    drawLayerFromData (layer) { // 画一个图层

    },
    selectLayer (e, layerId, index) { // 选择图层
      if (this.activeLayer !== index) {
        this.activeLayer = index
        this.mask.setFocus(layerId)
      }
    },
    importFromFile (e, layerId, index) { // 导入数据
      this.importData = !this.importData
    },
    deleteLayerGeometrys (layerId) { // 删除一个图层的gemetry，批量删除
      var that = this
      var postconfig = {
        method: 'post',
        url: 'api/removelayer/geometrys',
        dataType: 'json',
        data: {id: layerId},
        transformRequest: [function (data) { // 登录时处理数据格式,处理后后台接收的参数为data按顺序传递
          let ret = ''
          for (let it in data) {
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
          }
          return ret
        }]
      }
      return this.axios(postconfig)
    },
    deleteOneLayer (layerId) { // 从数据库删除一个图层，
      var that = this
      var postconfig = {
        method: 'post',
        url: 'api/removelayer',
        dataType: 'json',
        data: {id: layerId},
        transformRequest: [function (data) { // 登录时处理数据格式,处理后后台接收的参数为data按顺序传递
          let ret = ''
          for (let it in data) {
            ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
          }
          return ret
        }]
      }
      // console.log(this.axios(postconfig))
      return this.axios(postconfig)
    },
    deleteLayer (e, layerId, index) { // 删除图层
      this.confirm(layerId, index) // 确认是否删除
    },
    clearGeometrys (layerId) { // 删除图层上的geometrys

    },
    clearlayers (index) { // 删除页面上图层
      this.layersget.splice(index, 1)
    },
    confirm (layerId, index) { // 确认是否删除
      var that = this
      this.$Modal.confirm({
        title: '请确认是否删除',
        content: '<p>删除后不可恢复，请注意！</p>',
        onOk: () => {
          that.deleteLayerGeometrys(layerId).then(res => {
            console.log(res)
            if (res.data.msg == 'success') {
              that.$Message.info('删除图层内容成功')
              that.deleteOneLayer(layerId).then(res => {
                that.$Message.info('删除图层成功')
                that.clearlayers(index)
                // that.layerIsChange()
                console.log(res)
              }).catch(error => {
                that.$Message.info('删除图层未成功')
                console.log(error)
              })
            }
          })
            .catch(error => {
              that.$Message.info('删除图层内容未成功')
              console.log(error)
            })
          /*          this.$Message.info('删除图层')
          that.deleteLayerGeometrys(layerId).then(
            console.log('删除未成功')
            that.deleteOneLayer(layerId)
        ).catch(error => {
            that.$Message.info('删除未成功')
            console.log(error)
          }) */
        },
        onCancel: () => {
          // this.$Message.info('Clicked cancel')
        }
      })
    },
    deleteSuccess (index) { // 图层变化
      this.layersget.splice(index, 1)
      this.mask.setFocus(this.layersget[0].layerId)
      // this.$emit('layerChangeFromSon')
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
          this.layersget[this.activeLayer].layerGround = backcounty
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
      this.getBoundary(backcounty)
      // this.saveLayer(this.layersget[this.activeLayer])
    },
    getBoundary: function (backcounty) {
      var map = this.$parent.map
      var bdary = new window.BMap.Boundary()
      var layer = this.layersget[this.activeLayer]
      var me = this
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
        if (layer.layerId !== undefined) {
          me.mask.deleteOverlays(layer.layerId)
        }
        for (var j = 0; j < pointArray.length; j++) { // 简化行政区域的点
          var formatPolygon = { }
          formatPolygon.geometryName = backcounty
          formatPolygon.geometryClass = 'PLYGON'
          formatPolygon.layerId = layer.layerId
          formatPolygon.isBackground = 1
          var pointArrayJson = []
          for (var k = 0; k < pointArray[j].length; k++) {
            pointArrayJson.push({
              'lng': pointArray[j][k].lng,
              'lat': pointArray[j][k].lat
            })
          }
          formatPolygon.geometryData = pointArrayJson
          console.log(formatPolygon)
          me.mask.addOverlay(formatPolygon)
          // formatGroundData.push(formatPolygon)
          /*          var ply1 = new window.BMap.Polygon(pointArray[j], {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8})
          ply1.setFillOpacity(0.1)
          map.addOverlay(ply1) */
        }
      })
    },
    drawLayer () { // 开始绘制区域图层
      this.generateDrawTool()
    },
    generateDrawTool () { // 生成绘制区域的工具
      this.$parent.generateDrawTool()
      this.drawTool = this.$parent.drawTool
      this.drawTool.removeEventListener('add')
      this.drawTool.addEventListener('overlaycomplete', this.overlaycomplete, 'add')
    },
    overlaycomplete (e) {
      var map = this.$parent.map
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
          /*          layer.layerData.push(gridPoly)
          var polygonObject = new MyOverlay(map, gridPoly, layer.layerData, this, false, e.overlay)
          this.overlayMap.set(gridPoly, polygonObject) */
        },
        onCancel: function () {
          map.removeOverlay(e.overlay)
        }
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

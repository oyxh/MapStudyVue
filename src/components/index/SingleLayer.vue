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
        <button type="success" class ="buttonRight">保存图层</button>
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
    selectLayer (e, layerName, index) {
      this.activeLayer = index
    },
    deleteLayer (e, layerId, index) {
      this.confirm(layerId) // 确认是否删除
    },
    confirm (layerId, layerName) { // 确认是否
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
    changeSuccess () {
      this.$emit('layerChangeFromSon')
    },
    drawerClose: function () {
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
    setBackGroundLayer (backcounty) {
      this.layersget[this.activeLayer].layerGround = backcounty
      this.getBoundary(backcounty)
    },
    getBoundary: function (backcounty) {
      this.map = this.$parent.$parent.map
      var map = this.map
      var bdary = new window.BMap.Boundary()
      bdary.get(backcounty, function (rs) { // 获取行政区域
        map.clearOverlays() // 清除地图覆盖物
        var count = rs.boundaries.length // 行政区域的点有多少个
        if (count === 0) {
          alert('未能获取当前输入行政区域')
          return
        }
        var pointArray = []
        for (var i = 0; i < count; i++) {
          var ply = new window.BMap.Polygon(rs.boundaries[i], {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8}) // 建立多边形覆盖物
          ply.setFillOpacity(0.1)
          map.addOverlay(ply) // 添加覆盖物
          pointArray = pointArray.concat(ply.getPath())
        }
        map.setViewport(pointArray) // 调整视野
      })
    },
    drawLayer () {
      this.generateDrawTool()
    },
    generateDrawTool () {
      this.drawTool = this.$parent.$parent.drawTool
      this.$parent.$parent.generateDrawTool()
      this.drawTool.removeEventListener('add')
      this.drawTool.addEventListener('overlaycomplete', this.overlaycomplete, 'add')
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

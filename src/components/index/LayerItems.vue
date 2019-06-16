<template>
  <div>
    <promp-window @sendName="addLayer" ></promp-window>
    <br>
    <Button type="primary" long>导入数据</Button>
    <br><br>
    <single-layer :layerChange="watchLayerChange" @layerChangeFromSon="layerIsChange"></single-layer>
  </div>
</template>

<script>
import SingleLayer from './SingleLayer'
import PrompWindow from './promp'
export default {
  name: 'LayerItems',
  components: {SingleLayer, PrompWindow},
  data () {
    return {
      watchLayerChange: false // 图层变化监控，如图层变动，该值反向
    }
  },
  mounted () {
    this.watchLayerChange = !this.watchLayerChange // 该值变化singlelayer会重新请求数据库的图层信息并重新生成
  },
  methods: {
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
            that.layerIsChange()
            console.log(response)
            // that.startDraw()
          })
        .catch(function (error) {
          console.log(error)
        }) // axios
    },
    layerIsChange () {
      this.watchLayerChange = !this.watchLayerChange
    }
  }
}
</script>

<style scoped>

</style>

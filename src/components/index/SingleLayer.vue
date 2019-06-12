<template>
  <div >
    <div v-for="(layer,index) in this.layersget" :key="layer.layerId" >
      <div class="layerstyle">
        <label>图层名称:{{layer.layerName}}- {{ index }}</label>
        <label >
          关闭编辑
        </label>
        <input  type="checkbox" value="checked" >

        <button type="button" class="am-close" > </button>

      </div>
      <div>
        <button >图层绘制</button>
        <button >图层绘制</button>
        <button >图层绘制</button>
        <button >图层绘制</button>
      </div>
      <div style="clear: both;display: none;"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SingleLayer',
  data: function () {
    return {
      layersget: [{layerId: null, layerName: null, layerData: null, userId: null}]
    }
  },
  mounted () {
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
}
</script>

<style scoped>
  .layerstyle{
    color:  #868E8E;
    fontSize: 13px;
    height:38px;
    background:#D8D8D8;
    width:100%;
    float:right;
    textAlign:left;
    lineHeight:38px;
    display:inline-block;
    float:left;
  }
</style>

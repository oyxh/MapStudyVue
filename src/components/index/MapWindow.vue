<template>
  <div class="mapcontent">
    <div class="leftsider" :class={active:isActive}>
      <layer-item></layer-item>
    </div>
    <div id ="allmap" class = "allmapstyle" :class={active:isActive}>
      <div id="map" ></div>
    </div>
  </div>
</template>

<script>
import LayerItem from './LayerItems.vue'
export default {
  props: ['isActive'],
  name: 'MapWindow',
  components: {LayerItem},
  data () {
    return {
      map: null, // 图层
      test: 'test'
    }
  },
  mounted () {
    var map = new window.BMap.Map('allmap', {enableMapClick: false})
    var poi = new window.BMap.Point(116.307852, 40.057031)
    map.centerAndZoom(poi, 16)
    map.enableScrollWheelZoom()
    this.map = map
  },
  methods: {

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

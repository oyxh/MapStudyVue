<template>
  <div class="mapcontent">
    <div class="leftsider">window</div>
    <div id="allmap" >
      <div id="map" ></div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['isActive'],
  name: 'MapWindow',
  mounted () {
    var map = new window.BMap.Map('allmap', {enableMapClick: false})
    var poi = new window.BMap.Point(116.307852, 40.057031)
    map.centerAndZoom(poi, 16)
    map.enableScrollWheelZoom()
  },
  methods: {

  }
}
</script>

<style scoped>
  #allmap{
    margin:3px 0 0;
    height:900px;
    margin-left: 230px;
  }
  .leftsider{
    width: 230px;
    height: 100%;
    background: #d7e6e1;
    float: left;
  }
  .mapcontent{
    height:903px;
  }
</style>

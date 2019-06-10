<template>
  <div id="allmap" >
    <div id="map" ></div>
  </div>
</template>

<script>
export default {
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
    margin:3px 0 0;height:900px;
  }
</style>

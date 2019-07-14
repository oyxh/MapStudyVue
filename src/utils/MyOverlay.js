/* eslint-disable no-unused-vars */
import MyPolygon from './MyPolygon'
import LitOverlay from './LitOverlay'
class MyOverlay {
  constructor (map, layerData, flag, isGroundData) {
    this._map = map
    this._layerData = layerData
    this._pointArray = []
    this._isGroundData = isGroundData
    this.initOverlay()
    if (flag) {
      map.setViewport(this._pointArray)
    }
    /* this._overlay = new window.BMap.Polygon(pointArray, {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8})
    this._overlay.setFillOpacity(0.1)
    map.addOverlay(this._overlay)
    this._polygon = new MyPolygon(pointArray, map) */
  }
  initOverlay () {
    var map = this._map
    var polygon = this._layerData
    for (var i = 0; i < polygon.polygonData.length; i++) {
      this._pointArray.push(new window.BMap.Point(polygon.polygonData[i].lng, polygon.polygonData[i].lat))
    }
    this._overlay = new window.BMap.Polygon(this._pointArray, {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8})
    this._overlay.setFillOpacity(0.1)
    var labelName = polygon.polygonName
    if (!this._isGroundData) {
      this._overlay.addEventListener('dblclick', function () {
        alert('this overlay is click')
        alert(labelName)
      })
    }
    console.log(this._overlay)
    map.addOverlay(this._overlay)
    this._polygon = new MyPolygon(this._pointArray, map)
    var labelPositoin = this._polygon.getSevaralPoint(labelName.length)
    var myClass = this._overlayLabel = new LitOverlay(labelPositoin, labelName)
    map.addOverlay(this._overlayLabel)
    var removeMyOverlay = function (e, ee, overlay) { // 回掉函数有三个参数，前两个事件，第三个覆盖物
      alert(overlay)
      map.removeOverlay(overlay)
      myClass.remove()
    }
    // 创建右键菜单
    var markerMenu = new window.BMap.ContextMenu()
    markerMenu.addItem(new window.BMap.MenuItem('删除', removeMyOverlay.bind(this._overlay)))
    this._overlay.addContextMenu(markerMenu)
    // myClass.alertName()
    // myClass.alertName()
    // var test = new LitOverlay('test')
    // var myCompOverlay = new LitOverlay(new window.BMap.Point(areaCentre.lng, areaCentre.lat), '银湖', this._map)
    // this._map.addOverlay(myCompOverlay)
  }
  get layerData () {
    return this._layerData
  }
  set layerData (layerData) {
    this._layerData = layerData
  }
  get polygon () {
    return this._polygon
  }
  set polygon (polygon) {
    this._polygon = polygon
  }
  get map () {
    return this._map
  }
  set map (map) {
    this._map = map
  }
  get overlay () {
    return this._overlay
  }
  set overlay (overlay) {
    this._overlay = overlay
  }
}
export default MyOverlay

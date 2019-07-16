/* eslint-disable no-unused-vars */
import MyPolygon from './MyPolygon'
// import LitOverlay from './LitOverlay'
class MyOverlay {
  constructor (map, layerData, flag, isGroundData) {
    console.log('MyOverlay is mounted')
    this._map = map
    this._layerData = layerData
    this._pointArray = []
    this._isGroundData = isGroundData
    this.initOverlay()
    if (flag) {
      map.setViewport(this._pointArray)
    }
  }
  initOverlay () {
    var polygon = this._layerData
    for (var i = 0; i < polygon.polygonData.length; i++) {
      this._pointArray.push(new window.BMap.Point(polygon.polygonData[i].lng, polygon.polygonData[i].lat))
    }
    this._overlay = new window.BMap.Polygon(this._pointArray, {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8})
    this._overlay.setFillOpacity(0.1)
    this._map.addOverlay(this._overlay)
    /* var removeMyOverlay = function (e, ee, overlay) { // 回掉函数有三个参数，前两个事件，第三个覆盖物
      map.removeOverlay(overlay)
      myClass.remove()
    }
    var labelName = polygon.polygonName
    if (!this._isGroundData) {
      // 创建右键菜单
      var markerMenu = new window.BMap.ContextMenu()
      markerMenu.addItem(new window.BMap.MenuItem('删除', removeMyOverlay.bind(this._overlay)))
      this._overlay.addContextMenu(markerMenu)

      this._overlay.addEventListener('click', function () {
        alert('this overlay is click')
        alert(labelName)
      })
    }

    this._polygon = new MyPolygon(this._pointArray, map)
    var labelPositoin = this._polygon.getSevaralPoint(labelName.length)
    var myClass = this._overlayLabel = new LitOverlay(labelPositoin, labelName)
    map.addOverlay(this._overlayLabel) */
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
    alert(this._map)
    return this._map
  }
  set map (map) {
    alert(map)
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

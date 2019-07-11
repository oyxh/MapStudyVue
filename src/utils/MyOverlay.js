/* eslint-disable no-unused-vars */
import MyPolygon from './MyPolygon'
import LitOverlay from './LitOverlay'
class MyOverlay {
  constructor (map, layerData, flag) {
    this._map = map
    this._layerData = layerData
    this._pointArray = []
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
    var polygon = this._layerData
    for (var i = 0; i < polygon.polygonData.length; i++) {
      this._pointArray.push(new window.BMap.Point(polygon.polygonData[i].lng, polygon.polygonData[i].lat))
    }
    this._overlay = new window.BMap.Polygon(this._pointArray, {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8})
    this._overlay.setFillOpacity(0.1)
    this._map.addOverlay(this._overlay)
    this._polygon = new MyPolygon(this._pointArray, this._map)
    var areaCentre = this._polygon.getPolygonAreaCenter()

    var myClass = new LitOverlay('xiaohui', 28)
    myClass.alertName()
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

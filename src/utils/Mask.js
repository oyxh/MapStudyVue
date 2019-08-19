function Mask (map, geometrys, geometrysInLayer, overlayMap) {
  this._map = map
  this._geometrys = geometrys
  this._geometrysInLayer = geometrysInLayer
  this._overlayMap = overlayMap
  this.initialize()
}
Mask.prototype.initialize = function () {
  for (let i = 0; i < this._geometrys.length; i++) {
    this.generateOverlay(this._geometrys[i])
  }
}
Mask.prototype.generateOverlay = function (geometry) {
  var pointArray = []
  for (var i = 0; i < geometry.geometryData.length; i++) {
    pointArray.push(new window.BMap.Point(geometry.geometryData[i].lng, geometry.geometryData[i].lat))
  }
  var overlay = new window.BMap.Polygon(pointArray, {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8})
  overlay.setFillOpacity(0.1)
  this._map.addOverlay(overlay)
}
export default Mask

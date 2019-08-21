import MyOverlay from './MyOverlay'
function Mask (map, geometrys, geometrysInLayer, overlayMap, layerItem) {
  this._map = map
  this._geometrys = geometrys
  this._geometrysInLayer = geometrysInLayer
  this._overlayMap = overlayMap
  this._myOverlays = []
  this._layerItem = layerItem
  this.initialize()
}
Mask.prototype.initialize = function () {
  for (let i = 0; i < this._geometrys.length; i++) {
    this.generateOverlay(this._geometrys[i])
  }
  console.log(this._overlayMap)
  // this.setFocus(this.layersget[0].layerId)
}
Mask.prototype.generateOverlay = function (geometry) {
  var pointArray = []
  for (var i = 0; i < geometry.geometryData.length; i++) {
    pointArray.push(new window.BMap.Point(geometry.geometryData[i].lng, geometry.geometryData[i].lat))
  }
  var overlay = new window.BMap.Polygon(pointArray, {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8})
  overlay.setFillOpacity(0.1)
  this._map.addOverlay(overlay)
  var myOverlay = new MyOverlay(this._map, geometry, overlay, this._layerItem, this)
  myOverlay.hide()
  this._overlayMap.set(geometry, myOverlay)
  this._myOverlays.push(myOverlay)
}
Mask.prototype.setFocus = function (layerId) {
  var me = this
  var lastLayerData = this._geometrysInLayer[this._activeLayerId]
  if (lastLayerData !== undefined) {
    lastLayerData.forEach(function (value) {
      me._overlayMap.get(value).hide()
    })
  }
  this._activeLayerId = layerId
  var layerData = this._geometrysInLayer[layerId]
  var pointArray = []
  if (layerData === undefined) {
    pointArray.push(new window.BMap.Point(116.404, 39.915))
  } else {
    layerData.forEach(function (value) {
      me._overlayMap.get(value).show()
      for (let j = 0; j < value.geometryData.length; j++) {
        pointArray.push(new window.BMap.Point(value.geometryData[j].lng, value.geometryData[j].lat))
      }
    })
  }
  this._map.setViewport(pointArray)
}
Mask.prototype.editPoint = function (mycircle) {
  console.log('Mask editPoint')
  console.log(mycircle)
  this._map.disableDoubleClickZoom()
  this._map.addEventListener('mousemove', this.moveAction.bind(this))
  // that._map.addEventListener('mousemove', moveAction(e, index))
  this._map.addEventListener('dblclick', this.dblclickAction.bind(this))
}
Mask.prototype.moveAction = function (e) {
  console.log('it movine')
  console.log(e.point.lng + ' ' + e.point.lat)
  console.log(e.point)
  // that._circles[index].setCenter(e.point)
  console.log(e.target)
}
Mask.prototype.dblclickAction = function (e) {
  console.log('it dblclickAction')
  // that._map.removeEventListener('mousedown', dragStart)
  this._map.removeEventListener('mousemove', this.moveAction)
  this._map.removeEventListener('dblclick', this.dblclickAction)
  this._map.enableDoubleClickZoom()
}
export default Mask

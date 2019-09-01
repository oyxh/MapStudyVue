/* eslint-disable eqeqeq */
import MyOverlay from './MyOverlay'
function Mask (map, geometrys, geometrysInLayer, overlayMap, layerItem) {
  this._map = map
  this._geometrys = geometrys
  this._geometrysInLayer = geometrysInLayer
  this._overlayMap = overlayMap
  this._myOverlays = []
  this._layerItem = layerItem
  this._mousemoveFlag = false
  this.initialize()
}
Mask.prototype.initialize = function () {
  for (let i = 0; i < this._geometrys.length; i++) {
    this.generateOverlay(this._geometrys[i])
  }
  this._map.addEventListener('zoomend', this.zoomAction.bind(this))
  console.log(this._overlayMap)
  // this.setFocus(this.layersget[0].layerId)
}
Mask.prototype.generateOverlay = function (geometry, type) {
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
  if (type == 'add') {
    console.log(geometry.layerId)
    if (this._geometrysInLayer[geometry.layerId] == undefined) {
      this._geometrysInLayer[geometry.layerId] = []
    }
    this._geometrysInLayer[geometry.layerId].push(geometry)
    myOverlay._exist = 2
  }
}
Mask.prototype.addOverlay = function (geometry) {
  console.log(geometry)
  this.generateOverlay(geometry, 'add')
  console.log(geometry.layerId)
  this.setFocus(geometry.layerId)
  console.log(this._overlayMap)
}
Mask.prototype.deleteOverlays = function (layerId) { // 删除 layserId上的所有覆盖5️⃣
  if (this._geometrysInLayer[layerId] == undefined) { return 0 }
  var geometrys = this._geometrysInLayer[layerId]
  for (let index in geometrys) {
    this._overlayMap.get(geometrys[index]).removeMyOverlay()
    this._overlayMap.delete(geometrys[index])
  }
  this._geometrysInLayer[layerId] = []
}
Mask.prototype.setFocus = function (layerId) {
  var me = this
  var lastLayerData = this._geometrysInLayer[this._activeLayerId]
  if (lastLayerData !== undefined) {
    /*    lastLayerData.forEach(function (value) {
      me._overlayMap.get(value).hide()
    }) */
    for (let index in lastLayerData) {
      me._overlayMap.get(lastLayerData[index]).hide()
    }
  }
  this._activeLayerId = layerId
  var layerData = this._geometrysInLayer[layerId]
  console.log(layerData)
  var pointArray = []
  if (layerData === undefined) {
    pointArray.push(new window.BMap.Point(116.404, 39.915))
  } else {
    /*    layerData.forEach(function (value) {
      me._overlayMap.get(value).show()
      for (let j = 0; j < value.geometryData.length; j++) {
        pointArray.push(new window.BMap.Point(value.geometryData[j].lng, value.geometryData[j].lat))
      }
    }) */
    for (let index in layerData) {
      me._overlayMap.get(layerData[index]).show()
      for (let j = 0; j < layerData[index].geometryData.length; j++) {
        pointArray.push(new window.BMap.Point(layerData[index].geometryData[j].lng, layerData[index].geometryData[j].lat))
      }
    }
  }
  console.log(pointArray)
  this._map.setViewport(pointArray)
}
Mask.prototype.getCircleRadius = function () {
  var centre = this._map.getCenter()
  let pixPoint = this._map.pointToPixel(centre)
  pixPoint.y += 3
  let point = this._map.pixelToPoint(pixPoint)
  return this._map.getDistance(centre, point)
}
Mask.prototype.getDistance = function (point1, point2) {
  return Math.sqrt((point1.lng - point2.lng) * (point1.lng - point2.lng) + (point1.lat - point2.lat) * (point1.lat - point2.lat))
}
Mask.prototype.zoomAction = function (e) {
  console.log('zoomAction')
  var radius = this.getCircleRadius()
  this._overlayMap.forEach(function (value) {
    if (value._isEdit) {
      for (let i = 0; i < value._pointArray.length; i++) {
        value._pointCircles[i].setRadius(radius)
        value._middleCircles[i].setRadius(radius)
      }
    }
  })
}
Mask.prototype.nearPoint = function (point, radius, myOverlay) {
  for (let i = 0; i < this._myOverlays.length; i++) {
    var value = this._myOverlays[i]
    if (value !== myOverlay && !value._isHide) {
      var insect = value.getInsect(point, radius)
      if (insect instanceof window.BMap.Point) {
        return insect
      }
    }
  }
}
export default Mask

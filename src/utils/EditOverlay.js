/* eslint-disable eqeqeq */

function EditOverlay (map, overlay, polygonData) {
  this._map = map
  this._overlay = overlay
  this._polygonData = polygonData
  this.initialize(map, overlay)
}
EditOverlay.prototype.initialize = function (map, overlay) {
  this._points = overlay.getPath()
  this._circles = [] // 存储编辑点
  let radius = this.getCircleRadius()
  var that = this
  var deletePoint = this._deletePoint = function (e, ee, overlay) { // 编辑点右键响应函数
    console.log('delete Point')
    map.removeOverlay(overlay)
    console.log(overlay)
    console.log(that.getPointIndex(overlay.getCenter()))
    let index = that.getPointIndex(overlay.getCenter())
    that._points.splice(index, 1)
    that._circles.splice(index, 1)
    console.log(that._polygonData)
    that._polygonData.splice(index, 1)
    that.redrawPolygon()
  }
  var dragStart = this._dragStart = function (e) {
    console.log('it dragging')
  }
  for (let i = 0; i < this._points.length; i++) { // 生成编辑点
    var anewcircle = new window.BMap.Circle(this._points[i], radius)
    anewcircle.setFillColor('blue')
    anewcircle.setFillOpacity(1)
    var markerMenu = new window.BMap.ContextMenu()
    markerMenu.addItem(new window.BMap.MenuItem('删除点', deletePoint))
    anewcircle.addContextMenu(markerMenu) // 以上三行添加编辑点右键菜单
    anewcircle.addEventListener('click', dragStart)
    this._circles.push(anewcircle)
    map.addOverlay(anewcircle)
  }
  this._zoomListen = function (e) {
    console.log('zoomend')
    let radius = that.getCircleRadius()
    for (let i = 0; i < that._circles.length; i++) {
      that._circles[i].setRadius(radius)
    }
  }
  this._map.addEventListener('zoomend', this._zoomListen)
  console.log(this._points)
}
EditOverlay.prototype.getCircleRadius = function () {
  var centre = this._map.getCenter()
  let pixPoint = this._map.pointToPixel(centre)
  pixPoint.y += 6
  let point = this._map.pixelToPoint(pixPoint)
  return this._map.getDistance(centre, point)
}
EditOverlay.prototype.addOverlays = function () {
  this._map.addEventListener('zoomend', this._zoomListen)
  for (let i = 0; i < this._circles.length; i++) {
    this._map.addOverlay(this._circles[i])
  }
}
EditOverlay.prototype.remove = function () {
  this._map.removeEventListener('zoomend', this._zoomListen)
  for (let i = 0; i < this._circles.length; i++) {
    this._map.removeOverlay(this._circles[i])
  }
}
EditOverlay.prototype.getPointIndex = function (point) {
  for (let i = 0; i < this._points.length; i++) {
    if (point == this._points[i]) {
      return i
    }
  }
  return -1
}
EditOverlay.prototype.redrawPolygon = function () {
  this._overlay.setPath(this._points)
}
export default EditOverlay

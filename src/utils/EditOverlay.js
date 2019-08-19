/* eslint-disable eqeqeq */

function EditOverlay (map, overlay, polygonData) {
  this._map = map
  this._overlay = overlay
  this._polygonData = polygonData
  this.initialize(map, overlay)
}
EditOverlay.prototype.initialize = function (map, overlay) {
  this._points = overlay.getPath()
  this._middlePoints = []
  this._circles = [] // 存储编辑点
  this._middles = [] // 存储中间编辑点(覆盖物)
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
    // 以上为多边形的顶点，以下为多边形的线段中点
    let midlng = (this._points[i].lng + this._points[(i + 1) % this._points.length].lng) / 2
    let midlat = (this._points[i].lat + this._points[(i + 1) % this._points.length].lat) / 2
    var addPoints = []
    addPoints.push(new window.BMap.Point(midlng, midlat))
    this.addMiddle(i, 0, addPoints)
  /*  var middlePoint = new window.BMap.Point(midlng, midlat)
    this._middlePoints.push(middlePoint)
    var amiddle = new window.BMap.Circle(middlePoint, radius * 0.9)
    amiddle.setFillColor('green')
    amiddle.setFillOpacity(1)
    this._middles.push(amiddle)
    map.addOverlay(amiddle) */
  }
  console.log(this._middles)
  console.log(this._circles)
  this._zoomListen = function (e) {
    console.log('zoomend')
    let radius = that.getCircleRadius()
    for (let i = 0; i < that._circles.length; i++) {
      that._circles[i].setRadius(radius)
      that._middles[i].setRadius(radius * 0.9)
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
    this._map.addOverlay(this._middles[i])
  }
}
EditOverlay.prototype.remove = function () {
  this._map.removeEventListener('zoomend', this._zoomListen)
  for (let i = 0; i < this._circles.length; i++) {
    this._map.removeOverlay(this._circles[i])
    this._map.removeOverlay(this._middles[i])
  }
}
EditOverlay.prototype.addMiddle = function (startIndex, num, addArray) { // startIndex ，替换起始序号，num替换数量，addArray:增加的中间点的点坐标（Point类型）
  for (let i = startIndex; i < num; i++) {
    this._map.removeOverlay(this._middles[i])
  }
  let radius = this.getCircleRadius()
  this._middlePoints.splice(startIndex, num)
  this._middles.splice(startIndex, num)
  for (let i = 0; i < addArray.length; i++) {
    var amiddle = new window.BMap.Circle(addArray[i], radius * 0.9)
    amiddle.setFillColor('green')
    amiddle.setFillOpacity(1)
    this._map.addOverlay(amiddle)
    this._middlePoints.splice(startIndex + i, 0, addArray[i])
    this._middles.splice(startIndex + i, 0, amiddle)
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

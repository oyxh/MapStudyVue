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
  for (let i = 0; i < this._points.length; i++) { // 生成编辑点
    var anewcircle = new window.BMap.Circle(this._points[i], radius)
    anewcircle.setFillColor('blue')
    anewcircle.setFillOpacity(1)
    var markerMenu = new window.BMap.ContextMenu()
    markerMenu.addItem(new window.BMap.MenuItem('删除点', this.deletePoint.bind(this)))
    anewcircle.addContextMenu(markerMenu) // 以上三行添加编辑点右键菜单
    anewcircle.addEventListener('click', this.dragStart.bind(anewcircle))
    this._circles.push(anewcircle)
    map.addOverlay(anewcircle)
    // 以上为多边形的顶点，以下为多边形的线段中点
    let addPoints = []
    addPoints.push(this.getMidPoint(this._points[i], this._points[(i + 1) % this._points.length]))
    this.addMiddle(i, 0, addPoints)
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
  this._map.addEventListener('click', this.stopBubble)
  this._map.addEventListener('zoomend', this.zoomListen.bind(this))
  //  this._map.addEventListener('mousemove', this._moveAction)
}
EditOverlay.prototype.getMidPoint = function (point1, point2) {
  let midlng = (point1.lng + point2.lng) / 2
  let midlat = (point1.lat + point2.lat) / 2
  return new window.BMap.Point(midlng, midlat)
}
EditOverlay.prototype.getCircleRadius = function () {
  var centre = this._map.getCenter()
  let pixPoint = this._map.pointToPixel(centre)
  pixPoint.y += 6
  let point = this._map.pixelToPoint(pixPoint)
  return this._map.getDistance(centre, point)
}
EditOverlay.prototype.addOverlays = function () {
  this._map.addEventListener('zoomend', this.zoomListen)
  this._map.addEventListener('click', this.stopBubble)
  for (let i = 0; i < this._circles.length; i++) {
    this._map.addOverlay(this._circles[i])
    this._map.addOverlay(this._middles[i])
  }
}
EditOverlay.prototype.remove = function () {
  this._map.removeEventListener('zoomend', this.zoomListen)
  this._map.removeEventListener('click', this.stopBubble)
  for (let i = 0; i < this._circles.length; i++) {
    this._map.removeOverlay(this._circles[i])
    this._map.removeOverlay(this._middles[i])
  }
}
EditOverlay.prototype.addMiddle = function (startIndex, num, addArray) { // startIndex ，替换起始序号，num替换数量，addArray:增加的中间点的点坐标（Point类型）
  var arrayLen = this._points.length
  for (let i = startIndex; i < startIndex + num; i++) {
    this._map.removeOverlay(this._middles[i % arrayLen])
  }
  let radius = this.getCircleRadius()
  this._middlePoints.splice(startIndex, num)
  this._middles.splice(startIndex, num)
  console.log(addArray.length)
  for (let i = 0; i < addArray.length; i++) {
    var amiddle = new window.BMap.Circle(addArray[i], radius * 0.9)
    amiddle.setFillColor('green')
    amiddle.setFillOpacity(1)
    this._middlePoints.splice((startIndex + i) % arrayLen, 0, addArray[i])
    this._middles.splice((startIndex + i) % arrayLen, 0, amiddle)
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
EditOverlay.prototype.deletePoint = function (e, ee, overlay) { // 编辑点右键响应函数
  this._map.removeOverlay(overlay)
  let index = this.getPointIndex(overlay.getCenter())
  console.log(index)
  var addPoints = []
  addPoints.push(this.getMidPoint(this._points[(index + this._points.length - 1) % this._points.length], this._points[(index + 1) % this._points.length]))
  this.addMiddle((index + this._points.length - 1) % this._points.length, 2, addPoints)
  this._points.splice(index, 1)
  this._circles.splice(index, 1)
  console.log(this._polygonData)
  this._polygonData.splice(index, 1)
  this.redrawPolygon()
}
EditOverlay.prototype.stopBubble = function (e) {
  console.log('it _stopBubble')
  this._map.disableDoubleClickZoom()
}
EditOverlay.prototype.moveAction = function (e, index) {
  console.log('it movine')
  console.log(e.point.lng + ' ' + e.point.lat)
  console.log(e.point)
  console.log(this._circles[index])
  // that._circles[index].setCenter(e.point)
  console.log(e.target)
}
EditOverlay.prototype.dblclickAction = function (e) {
  console.log('it dblclickAction')
  // that._map.removeEventListener('mousedown', dragStart)
  this._map.removeEventListener('mousemove', this.moveAction)
  this._map.removeEventListener('dblclick', this.dblclickAction)
}
EditOverlay.prototype.dragStart = function (e) {
  console.log('it dragging')
  console.log(this)
  // console.log(this)
  let index = this.getPointIndex(this.getCenter())
  this._map.addEventListener('mousemove', this.moveAction)
  // that._map.addEventListener('mousemove', moveAction(e, index))
  this._map.addEventListener('dblclick', this.dblclickAction)
  console.log(index)
}
EditOverlay.prototype.zoomListen = function (e) {
  let radius = this.getCircleRadius()
  for (let i = 0; i < this._circles.length; i++) {
    this._circles[i].setRadius(radius)
    this._middles[i].setRadius(radius * 0.9)
  }
}
EditOverlay.prototype.redrawPolygon = function () {
  this._overlay.setPath(this._points)
}
export default EditOverlay

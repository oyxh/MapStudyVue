/* eslint-disable eqeqeq */

function MyCircle (map, centre, radius, type, myOverlay) {
  this._map = map
  this._centre = centre
  this._radius = radius
  this._type = type
  this._myOverlay = myOverlay
  this.initialize()
}
MyCircle.prototype.initialize = function () {
  this._color = (this._type == 'point') ? 'blue' : 'green'
  this._radius = (this._type == 'point') ? this._radius : this._radius * 0.9
  this._circle = new window.BMap.Circle(this._centre, this._radius)
  this._circle.setFillColor(this._color)
  this._circle.setFillOpacity(1)
  /*  var markerMenu = new window.BMap.ContextMenu()
  markerMenu.addItem(new window.BMap.MenuItem('删除点', this.deletePoint.bind(this)))
  anewcircle.addContextMenu(markerMenu) // 以上三行添加编辑点右键菜单
  anewcircle.addEventListener('click', this.dragStart.bind(anewcircle)) */
  // this._myOverlay.addEditPoints(this)
  // this._map.addOverlay(this._circle)
}
export default MyCircle

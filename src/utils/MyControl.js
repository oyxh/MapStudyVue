/* eslint-disable eqeqeq */
function MyControl (point, text) {
  this.defaultAnchor = window.BMAP_ANCHOR_TOP_LEFT
  this.defaultOffset = new window.BMap.Size(10, 10)
}
MyControl.prototype = new window.BMap.Control()
MyControl.prototype.initialize = function (map) {
  // 创建一个DOM元素
  this._stick = true
  this._link = ['static/img/stick.jpg', 'static/img/nostick.jpg']
  var container = this.container = document.createElement('div')
  // container.className = 'BMapLib_Drawing'
  // 用来设置外层边框阴影
  /* container.style.border = '1px solid blue' */
  container.style.backgroundColor = 'blue'
  // container.style.width = '65px'
  // container.style.height = '56px'
  var panel = this.panel = document.createElement('div')
  panel.style.width = '32.5px'
  panel.style.height = '28px'
  // panel.className = 'BMapLib_Drawing_panel'
  container.appendChild(panel)
  // 添加内容，该语句改变panel内的内容
  panel.innerHTML = this._generalHtml()

  // 绑定事件
  this._bind(panel)
  // 添加DOM元素到地图中
  map.getContainer().appendChild(container)
  // 将DOM元素返回
  console.log(map.getContainer())
  console.log(container)
  return container
}
// 生成工具栏的html元素
MyControl.prototype._generalHtml = function () {
  var stick = this._stick
  var link = this._stick ? this._link[0] : this._link[1]
  var getItem = function () {
    return '<a href="javascript:void(0)" title="吸附" ><img src=" ' + link + '" stick="' + stick + '" width=100% height= 100%  alt="吸附" /></a>'
  }
  var html = getItem()
  return html
}
MyControl.prototype._bind = function (panel) {
  var me = this
  panel.onclick = function (e) {
    var target = e.target
    var stick = target.getAttribute('stick') === 'true'
    me._stick = !stick
    panel.innerHTML = me._generalHtml()
  }
}
MyControl.prototype.getStick = function () {
  return this._stick
}
export default MyControl

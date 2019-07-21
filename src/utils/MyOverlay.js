/* eslint-disable no-unused-vars */
import MyPolygon from './MyPolygon'
import LitOverlay from './LitOverlay'
class MyOverlay {
  constructor (map, layerData, arrayset, thisDom, isGroundData, overlay) {
    this._map = map
    this._arrayset = arrayset
    this._thisDom = thisDom
    this._isGroundData = isGroundData
    this._layerData = layerData
    if (overlay === undefined) {
      this._pointArray = []
      var polygon = this._layerData
      for (var i = 0; i < polygon.polygonData.length; i++) {
        this._pointArray.push(new window.BMap.Point(polygon.polygonData[i].lng, polygon.polygonData[i].lat))
      }
      this._overlay = new window.BMap.Polygon(this._pointArray, {strokeWeight: 2, strokeColor: '#ff0000', strokeOpacity: 0.8})
      this._overlay.setFillOpacity(0.1)
      this._map.addOverlay(this._overlay)
      this.initOverlay()
    } else {
      this._pointArray = overlay.getPath()
      this._overlay = overlay
      this.initOverlay()
    }
  }
  initOverlay () {
    this._polygon = new MyPolygon(this._pointArray, this._map)
    this.showLabel()
    this._exist = true
    var map = this._map
    var that = this
    var removeMyOverlay = function (e, ee, overlay) { // 回掉函数有三个参数，前两个事件，第三个覆盖物
      that.deleteOverlay()
    }
    var editMyOverlay = function (e, ee, overlay) { // 回掉函数有三个参数，前两个事件，第三个覆盖物
      overlay.enableEditing()
    }
    var editClose = function (e, ee, overlay) { // 回掉函数有三个参数，前两个事件，第三个覆盖物
      that._layerData.polygonData = that.coverseMapPointsToJson(overlay.getPath())
      overlay.disableEditing()
    }
    var editName = function (e, ee, overlay) { // 回掉函数有三个参数，前两个事件，第三个覆盖物
      that.editContext()
    }
    if (!this._isGroundData) {
      // 创建右键菜单
      var markerMenu = new window.BMap.ContextMenu()
      markerMenu.addItem(new window.BMap.MenuItem('删除区域', removeMyOverlay.bind(this._overlay)))
      markerMenu.addItem(new window.BMap.MenuItem('变更名字', editName.bind(this._overlay)))
      markerMenu.addItem(new window.BMap.MenuItem('编辑区域', editMyOverlay.bind(this._overlay)))
      markerMenu.addItem(new window.BMap.MenuItem('保存编辑', editClose.bind(this._overlay)))
      this._overlay.addContextMenu(markerMenu)
    }
    /* var myClass = this._overlayLabel = new LitOverlay(labelPositoin, labelName)
    this.map.addOverlay(this._overlayLabel) */
  }
  deleteOverlay () {
    this._map.removeOverlay(this._overlay)
    this._overlayLabel.remove()
    for (let i = 0; i < this._arrayset.length; i++) {
      if (this._arrayset[i] === this._layerData) {
        this._arrayset.splice(i, 1)
      }
    }
    this._exist = false
  }
  coverseMapPointsToJson (pointArray) { // 转化为json
    var pointArrayJson = []
    console.log(pointArrayJson)
    for (var k = 0; k < pointArray.length; k++) {
      pointArrayJson.push({
        'lng': pointArray[k].lng,
        'lat': pointArray[k].lat
      })
    }
    console.log(pointArrayJson)
    console.log('converse sucsees')
    return pointArrayJson
  }
  editContext () {
    var that = this
    this._thisDom.$Modal.confirm({
      title: '请输入网格信息：',
      render: (h) => {
        const inputData = [{
          domProps: {
            value: that._layerData.polygonName,
            autofocus: true,
            placeholder: '请输入网格名字...',
            style: 'color:red;width:100%;margin-bottom:8px'
          },
          on: {
            input: (val) => {
              that._labelName = that._layerData.polygonName = val.target.value
            }
          }
        },
        {
          domProps: {
            value: that._layerData.polygonMana,
            autofocus: true,
            placeholder: '请输入网格负责人...',
            style: 'color:red;width:100%'
          },
          on: {
            input: (val) => {
              that._layerData.polygonMana = val.target.value
            }
          }
        }
        ]
        return h('div', inputData.map(item => h('input', item)))
      },
      onOk: function () {
        that.showLabel() // 变更名字
      },
      onCancel: function () {
      }
    })
  }
  showLabel () { // 显示多边形的名字
    if (this._overlayLabel !== undefined) {
      this._overlayLabel.remove()
    }
    var labelName = this._labelName = this._layerData.polygonName
    var labelPositoin = this._polygon.getSevaralPoint(labelName.length)
    this._overlayLabel = new LitOverlay(labelPositoin, labelName)
    this._map.addOverlay(this._overlayLabel)
    this._overlayLabel.draw()
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
  get exist () {
    return this._exist
  }
  set exist (exist) {
    this._exist = exist
  }
}
export default MyOverlay

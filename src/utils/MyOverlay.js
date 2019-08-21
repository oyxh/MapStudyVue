/* eslint-disable eqeqeq */
import LitOverlay from './LitOverlay'
import MyPolygon from './MyPolygon'
import MyCircle from './MyCircle'
function MyOverlay (map, geometry, overlay, layerItem, mask) {
  this._map = map
  this._geometry = geometry
  this._overlay = overlay
  this._layerItem = layerItem
  this._mask = mask
  this.initialize()
}
MyOverlay.prototype.initialize = function () {
  this._pointArray = this._overlay.getPath()
  this._middleArray = []
  for (let i = 0; i < this._pointArray.length; i++) {
    this._middleArray.push(this.getMiddlePoint(this._pointArray[i], this._pointArray[(i + 1) % this._pointArray.length]))
  }
  this._pointCircles = []
  this._middleCircles = []
  this._polygon = new MyPolygon(this._pointArray, this._map)
  this._exist = true
  this._isEdit = false
  this.showLabel()
  var markerMenu = new window.BMap.ContextMenu()
  markerMenu.addItem(new window.BMap.MenuItem('删除区域', this.removeMyOverlay.bind(this)))
  markerMenu.addItem(new window.BMap.MenuItem('变更名字', this.editName.bind(this)))
  markerMenu.addItem(new window.BMap.MenuItem('编辑区域', this.editMyOverlay.bind(this)))
  markerMenu.addItem(new window.BMap.MenuItem('保存编辑', this.editClose.bind(this)))
  this._overlay.addContextMenu(markerMenu)
}
MyOverlay.prototype.getMiddlePoint = function (point1, point2) {
  var midLng = (point1.lng + point2.lng) / 2
  var midLat = (point1.lat + point2.lat) / 2
  return new window.BMap.Point(midLng, midLat)
}
MyOverlay.prototype.getIndex = function (mycircle) {
  var index = -1
  for (let i = 0; i < this._pointArray.length; i++) {
    var tempPoint = (mycircle._type == 'point') ? this._pointArray[i] : this._middleArray[i]
    if (tempPoint == mycircle._circle.getCenter()) {
      index = i
      return index
    }
  }
  return index
}
MyOverlay.prototype.showLabel = function () { // 显示多边形的名字
  if (this._overlayLabel !== undefined) {
    this._overlayLabel.remove()
  }
  var labelName = this._labelName = this._geometry.geometryName
  var labelPositoin = this._polygon.getSevaralPoint(labelName.length)
  this._overlayLabel = new LitOverlay(labelPositoin, labelName)
  this._map.addOverlay(this._overlayLabel)
  this._overlayLabel.draw()
}
MyOverlay.prototype.editName = function (e, ee) {
  console.log('editname')
  console.log(this)
  var that = this
  console.log(that._geometry)
  console.log(that._geometry.geometryName)
  this._layerItem.$Modal.confirm({
    title: '请输入网格信息：',
    render: (h) => {
      const inputData = [{
        domProps: {
          value: that._geometry.geometryName,
          autofocus: true,
          style: 'color:red;width:100%;margin-bottom:8px'
        },
        on: {
          input: (val) => {
            if (val.target.value !== that._geometry.geometryName) {
              that._labelName = that._geometry.geometryName = val.target.value
              that._isEdit = true
            }
          }
        }
      },
      {
        domProps: {
          value: that._geometry.geometryDes,
          autofocus: true,
          placeholder: '请输入网格负责人...',
          style: 'color:red;width:100%'
        },
        on: {
          input: (val) => {
            if (val.target.value !== that._geometry.geometryDes) {
              that._geometry.geometryDes = val.target.value
              that._isEdit = true
            }
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
MyOverlay.prototype.removeMyOverlay = function (e, ee) {
  console.log('removeMyOverlay')
  this._map.removeOverlay(this._overlay)
  this._overlayLabel.remove()
  this.removeEditPoints()
  /*  if (this._editOverlays !== undefined) {
    this._editOverlays.remove()
  } */
  // this._geometrysInLayer.delete(this._geometry.geometryId)
  this._exist = false
}
MyOverlay.prototype.editMyOverlay = function (e, ee) {
  console.log('editMyOverlay')
  for (let i = 0; i < this._pointArray.length; i++) {
    var mycircle = new MyCircle(this._map, this._pointArray[i], 15, 'point', this)
    var mymiddle = new MyCircle(this._map, this._middleArray[i], 15, 'middle', this)
    this.addEditPoints(mycircle)
    this.addEditPoints(mymiddle)
  }
  console.log(this._pointCircles)
  console.log(this._middleCircles)
}
MyOverlay.prototype.editClose = function (e, ee) {
  var that = this
  // that._editOverlays.remove()
  this.removeEditPoints()
  var geometrys = [that._geometry]
  that._layerItem.editGeometrys(geometrys)
    .then(function (response) {
      console.log(response)
      that._isEdit = false
      that._layerItem.$Message.info('保存成功')
    })
    .catch(function (error) {
      console.log(error)
      that._layerItem.$Message.info('保存未成功')
    }) // axios
  console.log('editClose')
}
MyOverlay.prototype.addEditPoints = function (mycircle) {
  this._map.addOverlay(mycircle._circle)
  if (mycircle._type == 'point') {
    this._pointCircles.push(mycircle)
  } else {
    this._middleCircles.push(mycircle)
  }
}
MyOverlay.prototype.deletePoint = function (mycircle) {
  console.log('delete Point')
  var index = this.getIndex(mycircle)
  var arrayLength = this._pointArray.length
  var pre = (index + arrayLength - 1) % arrayLength
  var next = (index + 1) % arrayLength
  this._map.removeOverlay(this._pointCircles[index]._circle)
  this._map.removeOverlay(this._middleCircles[pre]._circle)
  this._map.removeOverlay(this._middleCircles[index]._circle)
  var middle = this.getMiddlePoint(this._pointArray[pre], this._pointArray[next])
  var newMiddle = new MyCircle(this._map, middle, 15, 'middle', this)
  this._pointArray.splice(index, 1)
  this._pointCircles.splice(index, 1)
  this._middleArray.splice(pre, 2, middle)
  this._middleCircles.splice(pre, 2, newMiddle)
  this._geometry.geometryData.splice(index, 1)
  this._map.addOverlay(newMiddle._circle)
  this.redrawPolygon()
  console.log(index)
}
MyOverlay.prototype.editPoint = function (mycircle) {
  this._mask.editPoint(mycircle)
}
MyOverlay.prototype.endEdit = function (mycircle) {
  this._mask.endEdit(mycircle)
}
MyOverlay.prototype.removeEditPoints = function () {
  for (let i = 0; i < this._pointCircles.length; i++) {
    this._map.removeOverlay(this._pointCircles[i]._circle)
    this._map.removeOverlay(this._middleCircles[i]._circle)
  }
  this._pointCircles = []
  this._middleCircles = []
}
MyOverlay.prototype.redrawPolygon = function () {
  this._overlay.setPath(this._pointArray)
}
MyOverlay.prototype.hide = function () {
  this._overlay.hide()
  this._overlayLabel.hide()
  for (let i = 0; i < this._pointCircles.length; i++) {
    this._pointCircles[i]._circle.hide()
    this._middleCircles[i]._circle.hide()
  }
}
MyOverlay.prototype.show = function () {
  this._overlay.show()
  this._overlayLabel.show()
  for (let i = 0; i < this._pointCircles.length; i++) {
    this._pointCircles[i]._circle.show()
    this._middleCircles[i]._circle.show()
  }
}
export default MyOverlay

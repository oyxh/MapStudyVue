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
  this._mousemoveFlag = false
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
MyOverlay.prototype.getInsect = function (mycircle) {
  for (let i = 0; i < this._pointCircles.length; i++) {
    if (this._mask.getDistance(this._pointCircles[i]._circle.getCenter(), mycircle._circle.getCenter()) <
        this._pointCircles[i]._circle.getRadius() + mycircle._circle.getRadius()) {
      return this._pointCircles[i]._circle.getCenter()
    }
    if (this._mask.getDistance(this._middleCircles[i]._circle.getCenter(), mycircle._circle.getCenter()) <
      this._middleCircles[i]._circle.getRadius() + mycircle._circle.getRadius()) {
      return this._middleCircles[i]._circle.getCenter()
    }
  }

  return undefined
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
  var that = this
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
  this._isEdit = true
  var radius = this._mask.getCircleRadius()
  for (let i = 0; i < this._pointArray.length; i++) {
    var mycircle = new MyCircle(this._map, this._pointArray[i], radius, 'point', this)
    var mymiddle = new MyCircle(this._map, this._middleArray[i], radius, 'middle', this)
    this.addEditPoints(mycircle)
    this.addEditPoints(mymiddle)
  }
}
MyOverlay.prototype.editClose = function (e, ee) {
  var that = this
  that._isEdit = false
  // that._editOverlays.remove()
  this.removeEditPoints()
  var geometrys = [that._geometry]
  that._layerItem.editGeometrys(geometrys)
    .then(function (response) {
      console.log(response)
      that._layerItem.$Message.info('保存成功')
    })
    .catch(function (error) {
      console.log(error)
      that._layerItem.$Message.info('保存未成功')
    }) // axios
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
  var index = this.getIndex(mycircle)
  var arrayLength = this._pointArray.length
  var pre = (index + arrayLength - 1) % arrayLength
  var next = (index + 1) % arrayLength
  this._map.removeOverlay(this._pointCircles[index]._circle)
  this._map.removeOverlay(this._middleCircles[pre]._circle)
  this._map.removeOverlay(this._middleCircles[index]._circle)
  var middle = this.getMiddlePoint(this._pointArray[pre], this._pointArray[next])
  var radius = this._mask.getCircleRadius()
  var newMiddle = new MyCircle(this._map, middle, radius, 'middle', this)
  this._pointArray.splice(index, 1)
  this._pointCircles.splice(index, 1)
  this._middleArray.splice(pre, 2, middle)
  this._middleCircles.splice(pre, 2, newMiddle)
  this._geometry.geometryData.splice(index, 1)
  this._map.addOverlay(newMiddle._circle)
  this.redrawPolygon()
}
MyOverlay.prototype.replacePoint = function (index1, mycircle, point) { // 替换节点,点击后变化，分点击节点和点击中点
  var index = this.getIndex(mycircle)
  var pointLength = this._pointArray.length
  var pre = (index - 1 + pointLength) % pointLength
  var next = (index + 1) % pointLength
  var radius = this._mask.getCircleRadius()
  mycircle._circle.setCenter(point)
  var geometryDatePoint = {lng: point.lng, lat: point.lat}
  if (mycircle._type == 'point') {
    this._pointArray.splice(index, 1, point)
    this._geometry.geometryData.splice(index, 1, geometryDatePoint)
    var add1 = this.getMiddlePoint(this._pointArray[pre], this._pointArray[index])
    var add2 = this.getMiddlePoint(this._pointArray[index], this._pointArray[next])
    this._middleCircles[pre]._circle.setCenter(add1)
    this._middleCircles[index]._circle.setCenter(add2)
    this._middleArray.splice(pre, 1, add1)
    this._middleArray.splice(index, 1, add2)
  } else {
    var addmiddles = []
    addmiddles.push(this.getMiddlePoint(this._pointArray[index], point))
    addmiddles.push(this.getMiddlePoint(point, this._pointArray[next]))
    this._middleArray.splice(index, 1)
    this._middleCircles.splice(index, 1)
    for (let i = 0; i < addmiddles.length; i++) {
      var addMiddle = new MyCircle(this._map, addmiddles[i], radius, 'middle', this)
      this._map.addOverlay(addMiddle._circle)
      this._middleArray.splice(index + i, 0, addmiddles[i])
      this._middleCircles.splice(index + i, 0, addMiddle)
    }
    this._pointArray.splice(index + 1, 0, point)
    this._pointCircles.splice(index + 1, 0, mycircle)
    this._geometry.geometryData.splice(index + 1, 0, geometryDatePoint)
    mycircle._type = 'point'
    mycircle._circle.setRadius(radius)
    mycircle._circle.setFillColor('blue')
    mycircle._circle.setStrokeColor('blue') //  编辑点颜色改变
  }
}
MyOverlay.prototype.editPoint = function (mycircle) {
  this._map.disableDoubleClickZoom()
  var me = this
  this._moveAction = function (e) {
    var index = me.getIndex(mycircle)
    me.replacePoint(index, mycircle, e.point)
    me.redrawPolygon()
  }
  if (!this._mousemoveFlag) {
    this._mousemoveFlag = true
    this._map.addEventListener('mousemove', this._moveAction)
  }
}
MyOverlay.prototype.endEdit = function (mycircle) {
  this._map.removeEventListener('mousemove', this._moveAction)
  this._mousemoveFlag = false
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

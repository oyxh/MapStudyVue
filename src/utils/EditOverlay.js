function EditOverlay (map, overlay) {
  this._map = map
  this._overlay = overlay
  this.initialize(map, overlay)
}
EditOverlay.prototype.initialize = function (map, overlay) {
  console.log('EditOverlay')
  this._points = overlay.getPath()
  this._circles = []
  for (let i = 0; i < this._points.length; i++) {
    var anewcircle = new window.BMap.Circle(this._points[i], 20)
    anewcircle.setFillColor('blue')
    anewcircle.setFillOpacity(1)
    anewcircle.addEventListener('click', function (e) {
      console.log('click')
      console.log(e.target)
    })
    this._circles.push(anewcircle)
    map.addOverlay(anewcircle)
  }
  console.log(this._points)
}
EditOverlay.prototype.addOverlays = function () {
  for (let i = 0; i < this._circles.length; i++) {
    this._map.addOverlay(this._circles[i])
  }
}
EditOverlay.prototype.remove = function () {
  for (let i = 0; i < this._circles.length; i++) {
    this._map.removeOverlay(this._circles[i])
  }
}
EditOverlay.prototype.generateDiv = function (text) {
  var div = this._div = document.createElement('div')
  div.style.position = 'absolute'
  div.style.zIndex = window.BMap.Overlay.getZIndex(this._points[0].lat)
  // div.style.backgroundColor = '#EE5D5B'
  // div.style.border = '1px solid #BC3B3A'
  div.style.color = 'black'
  div.style.height = '18px'
  div.style.padding = '2px'
  div.style.lineHeight = '18px'
  div.style.whiteSpace = 'nowrap'
  div.style.MozUserSelect = 'none'
  div.style.fontFmily = 'Microsoft YaHei'
  // div.style.fontWeight = 'bold'
  div.style.fontSize = '14px'
  var span = document.createElement('span')
  div.appendChild(span)
  span.appendChild(document.createTextNode(text))
  return div
}
EditOverlay.prototype.draw = function () {
  var map = this._map
  var dis = 12
  if (this._points.length > 1) {
    var pixel0 = map.pointToOverlayPixel(new window.BMap.Point(this._points[0][0], this._points[0][1]))
    var pixel1 = map.pointToOverlayPixel(new window.BMap.Point(this._points[1][0], this._points[1][1]))
    dis = Math.sqrt((pixel1.x - pixel0.x) * (pixel1.x - pixel0.x) + (pixel1.y - pixel0.y) * (pixel1.y - pixel0.y))
  }
  if (dis > 14) {
    for (let i = 0; i < this._divs.length; i++) {
      this._divs[i].style.display = 'block'
      var pixel = map.pointToOverlayPixel(new window.BMap.Point(this._points[i][0], this._points[i][1]))
      this._divs[i].style.left = pixel.x - 7 + 'px'
      this._divs[i].style.top = pixel.y - 14 + 'px'
    }
  } else {
    for (let i = 0; i < this._divs.length; i++) {
      this._divs[i].style.display = 'none'
    }
  }
}

export default EditOverlay

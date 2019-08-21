function LitOverlay (point, text) {
  this._points = point
  this._text = text
}
LitOverlay.prototype = new window.BMap.Overlay()
LitOverlay.prototype.initialize = function (map) {
  this._map = map
  this._hide = true
  var divs = this._divs = []
  for (let i = 0; i < this._text.length; i++) {
    var div = this.generateDiv(this._text[i])
    divs.push(div)
    map.getPanes().labelPane.appendChild(div)
  }
}
LitOverlay.prototype.generateDiv = function (text) {
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
LitOverlay.prototype.remove = function () {
  var parent = this._map.getPanes().labelPane
  for (let i = 0; i < this._divs.length; i++) {
    parent.removeChild(this._divs[i])
  }
}
LitOverlay.prototype.draw = function () {
  if (!this._hide) {
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
  } else {
    for (let i = 0; i < this._divs.length; i++) {
      this._divs[i].style.display = 'none'
    }
  }
}
LitOverlay.prototype.hide = function () {
  this._hide = true
/*  for (let i = 0; i < this._divs.length; i++) {
    this._divs[i].style.display = 'none'
    console.log(this._divs[i])
  } */
}
LitOverlay.prototype.show = function () {
  this._hide = false
/*  for (let i = 0; i < this._divs.length; i++) {
    this._divs[i].style.display = ''
    console.log(this._divs[i])
  } */
}

export default LitOverlay

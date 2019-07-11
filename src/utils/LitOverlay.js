function LitOverlay (name, age) {
  this._name = name
  this._age = age
}
LitOverlay.prototype = new window.BMap.Overlay()
LitOverlay.prototype.alertName = function () {
  alert(this._name)
}
export default LitOverlay

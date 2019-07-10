/* eslint-disable no-unused-vars */
class MyOverlay {
  constructor (map, overlay) {
    this._map = map
    this._overlay = overlay
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
}

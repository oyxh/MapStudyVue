/* eslint-disable camelcase */
class MyPolygon {
  constructor (pointData) {
    this._pointData = []
    for (var i = 0; i < pointData.length; i++) {
      this._pointData.push([pointData[i].lng, pointData[i].lat])
    }
    console.log(this._pointData)
    console.log(this.getPolygonAreaCenter())
  }
  Area (p0, p1, p2) {
    var area = 0.0
    area = p0[0] * p1[1] + p1[0] * p2[1] + p2[0] * p0[1] - p1[0] * p0[1] - p2[0] * p1[1] - p0[0] * p2[1]
    return area / 2
  }
  getPolygonAreaCenter () {
    var sum_x = 0
    var sum_y = 0
    var sum_area = 0
    var points = this._pointData
    var p1 = points[1]
    for (var i = 2; i < points.length; i++) {
      var p2 = points[i]
      var area = this.Area(points[0], p1, p2)
      sum_area += area
      sum_x += (points[0][0] + p1[0] + p2[0]) * area
      sum_y += (points[0][1] + p1[1] + p2[1]) * area
      p1 = p2
    }
    var xx = sum_x / sum_area / 3
    var yy = sum_y / sum_area / 3
    return {lng: xx, lat: yy}
    // return new Point(xx, yy, new SpatialReference({wkid: 4326}))
  }
  get pointData () {
    return this._pointData
  }
  set pointData (pointData) {
    this._pointData = pointData
  }
}
export default MyPolygon

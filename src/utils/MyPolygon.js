/* eslint-disable camelcase,eqeqeq,one-var,no-unused-vars */
class MyPolygon {
  constructor (pointData, map) {
    this._pointData = []
    this._map = map
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
  vecCross (x1, y1, x2, y2) {
    return x1 * y2 - x2 * y1
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
  /*
方法名称：getMinXMaxX
功能描述：获取多边形X轴最小值与最大值
返回值:最小值minX，最大值maxX
*/
  getMinXMaxXminYmaxY () {
    var res = {minX: 999,
      maxX: -999,
      minY: 999,
      maxY: -999}
    if (this._pointData.length === 0) {
      return null
    }
    var item = null
    for (var i = 0; i < this._pointData.length; i++) {
      item = this._pointData[i]
      if (item[0] > res.maxX) {
        res.maxX = item[0]
      }
      if (item[0] < res.minX) {
        res.minX = item[0]
      }
      if (item[1] > res.maxY) {
        res.maxY = item[1]
      }
      if (item[1] < res.minY) {
        res.minY = item[1]
      }
    }
    return res
  }
  /*
方法名称：getSevaralPoint
功能描述：获取多边形里横向或竖向多个间隔相同的点，处于中间位置
参数描述：
  pointsNum：需要返回的点数
  返回值:合适的点数组
*/
  getSevaralPoint (pointsNum) {
    if (pointsNum <= 0) return null
    if (pointsNum == 1) return this.getPolygonAreaCenter()
    var isVerticle = false // false横向的点，true 竖向的点
    var lineList = []
    var line = null
    var bounds = this.getMinXMaxXminYmaxY()
    if (bounds.maxX - bounds.minX < bounds.maxY - bounds.minY) {
      isVerticle = true
      let linesGap = (bounds.maxY - bounds.minY) / 2 / (pointsNum - 1)
      for (let i = 0; i < pointsNum; i++) {
        line = { // 水平线段
          S: {
            x: bounds.minX,
            y: bounds.minY + (bounds.maxY - bounds.minY) / 4 + i * linesGap // 以1/4处为起始点按间距选pointNum条线
          },
          E: {
            x: bounds.maxX,
            y: bounds.minY + (bounds.maxY - bounds.minY) / 4 + i * linesGap
          }
        }
        lineList.push(line)
      }
    } else {
      isVerticle = false
      let linesGap = (bounds.maxX - bounds.minX) / 2 / (pointsNum - 1)
      for (let i = 0; i < pointsNum; i++) {
        line = { // 水平线段
          S: {
            x: bounds.minX + (bounds.maxX - bounds.minX) / 4 + i * linesGap,
            y: bounds.minY
          },
          E: {
            x: bounds.minX + (bounds.maxX - bounds.minX) / 4 + i * linesGap,
            y: bounds.maxY
          }
        }
        lineList.push(line)
      }
    }
    var pA = null
    var pB = null
    var pC = null
    var pD = null
    var resPoints = []
    var sumX = 0
    var sumY = 0
    var overlapCount = 0
    var polygonLines = this.getPolygonLine()
    for (let i = 0; i < lineList.length; i++) {
      sumX = 0
      sumY = 0
      overlapCount = 0
      pA = [lineList[i].S.x, lineList[i].S.y]
      pB = [lineList[i].E.x, lineList[i].E.y]
      for (let j = 0; j < polygonLines.length; j++) {
        pC = [polygonLines[j].S.x, polygonLines[j].S.y]
        pD = [polygonLines[j].E.x, polygonLines[j].E.y]
        let cross = this.getgetOverlapCross(pA, pB, pC, pD)
        if (cross >= 0 && cross <= 1) {
          console.log(pA[0] + cross * (pB[0] - pA[0]))
          console.log(pA[1] + cross * (pB[1] - pA[1]))
          console.log(pA)
          console.log(pB)
          console.log(pC)
          console.log(pD)
          sumX += pA[0] + cross * (pB[0] - pA[0])
          sumY += pA[1] + cross * (pB[1] - pA[1])
          overlapCount += 1
        }
      }
      resPoints.push([sumX / overlapCount, sumY / overlapCount])
    }
    return resPoints
  }
  /*
  方法名称：getPolygonLine
  功能描述：获取多边形除指定线段的其他线段
  参数描述：
  pointsList：多边形各个点的顺序数组
  line：指定排除的线段
  返回值:多边形线段数组
  */
  getPolygonLine () {
    var pointsList = this._pointData
    var len = pointsList.length,
      line = null,
      item = null,
      lineList = [],
      nextItem = null
    for (var i = 0; i < len; i++) {
      item = pointsList[i]
      if (i == len - 1) {
        nextItem = pointsList[0]
      } else {
        nextItem = pointsList[i + 1]
      }
      line = {
        S: {
          x: item[0],
          y: item[1]
        },
        E: {
          x: nextItem[0],
          y: nextItem[1]
        }
      }
      lineList.push(line)
    }
    return lineList
  }
  /*
  方法名称：getgetOverlapCross
  功能描述：求线段A(x1,y1)B(x2,y2)与C(x3,y3)D(x4,y4)的交点在AB上的位置
  参数描述：
  返回值:设交点为O，返回值为AO/AB，小于0交于A点左侧，大于1交于B点右侧，无穷大为平行，设最大值近似平行
  */
  getgetOverlapCross (pA, pB, pC, pD) {
    return (this.Area(pA, pC, pD) / this.Area(pA, pB, pD))
  }
}
export default MyPolygon

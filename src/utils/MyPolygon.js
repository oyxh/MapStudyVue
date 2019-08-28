/* eslint-disable camelcase,eqeqeq,one-var,no-unused-vars */
class MyPolygon {
  constructor (pointData, map) {
    this._pointData = []
    this._map = map
    for (var i = 0; i < pointData.length; i++) {
      this._pointData.push([pointData[i].lng, pointData[i].lat])
    }
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
  distance (pointX, pointY) {
    return Math.sqrt((pointX.x - pointY.x) * (pointX.x - pointY.x) + (pointX.y - pointY.y) * (pointX.y - pointY.y))
  }
  /**
   * 多边形包含点，包含返回true,否则返回false
   * @param point {x: ,y: }
   */
  contains (point) {
    var overlapCount = 0
    var polygonLines = this.getPolygonLine()
    var pB = [this.getMinXMaxXminYmaxY().maxX + 0.01, this.getMinXMaxXminYmaxY().maxY + 0.01]
    var pA = [point.x, point.y]
    var pC = null
    var pD = null
    for (let i = 0; i < polygonLines.length; i++) {
      pC = [polygonLines[i].S.x, polygonLines[i].S.y]
      pD = [polygonLines[i].E.x, polygonLines[i].E.y]
      let cross = this.getOverlapCross(pC, pD, pA, pB)
      let cross1 = this.getOverlapCross(pA, pB, pC, pD)
      if (cross >= 0 && cross <= 1 && cross1 >= 0 && cross1 <= 1) {
        // this._map.addOverlay(new window.BMap.Marker(new window.BMap.Point(pC[0], pC[1])))
        // this._map.addOverlay(new window.BMap.Marker(new window.BMap.Point(pD[0], pD[1])))
        overlapCount += 1
      }
    }
    if (overlapCount % 2 == 0) {
      return false
    } else {
      return true
    }
  }
  /**
   * 排序坐标，先按X排序，再按Y排序
   * @param a
   * @param b
   */
  sortPoint (a, b) {
    if (a.x - b.x == 0) {
      return a.y - b.y
    }
    return a.x - b.x
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
            y: bounds.maxY - (bounds.maxY - bounds.minY) / 4 - i * linesGap // 以1/4处为起始点按间距选pointNum条线
          },
          E: {
            x: bounds.maxX,
            y: bounds.maxY - (bounds.maxY - bounds.minY) / 4 - i * linesGap
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
    var overlaps = []
    for (let i = 0; i < lineList.length; i++) { //  lineList.length
      sumX = 0
      sumY = 0
      overlapCount = 0
      overlaps = []
      pA = [lineList[i].S.x, lineList[i].S.y]
      pB = [lineList[i].E.x, lineList[i].E.y]
      for (let j = 0; j < polygonLines.length; j++) {
        pC = [polygonLines[j].S.x, polygonLines[j].S.y]
        pD = [polygonLines[j].E.x, polygonLines[j].E.y]
        let cross = this.getOverlapCross(pC, pD, pA, pB)
        if (cross >= 0 && cross <= 1) {
          overlaps.push({x: pC[0] + cross * (pD[0] - pC[0]), y: pC[1] + cross * (pD[1] - pC[1])}) // 交点+1
          sumX += pC[0] + cross * (pD[0] - pC[0])
          sumY += pC[1] + cross * (pD[1] - pC[1])
          overlapCount += 1
        }
      }
      overlaps.sort(this.sortPoint)
      let dis = 0
      let maxDis = 0
      var startPoint = overlaps[0]
      var endPoint = overlaps[0]
      var maxGap = {startPoint: startPoint, endPoint: endPoint}
      for (let j = 0; j < overlaps.length - 1; j++) { // overlaps.length - 1
        let midPoint = {x: (overlaps[j].x + overlaps[j + 1].x) / 2, y: (overlaps[j].y + overlaps[j + 1].y) / 2}
        if (this.contains(midPoint)) {
          // endPoint = overlaps[j + 1]
          dis += this.distance(overlaps[j], overlaps[j + 1])
          endPoint = overlaps[j + 1]
          if (dis > maxDis) {
            maxDis = dis
            dis = 0
            maxGap.startPoint = startPoint
            maxGap.endPoint = endPoint
          }
        } else {
          startPoint = endPoint = overlaps[j + 1]
        }
      }
      resPoints.push([(maxGap.startPoint.x + maxGap.endPoint.x) / 2, (maxGap.startPoint.y + maxGap.endPoint.y) / 2])
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
  方法名称：getOverlapCross
  功能描述：求线段A(x1,y1)B(x2,y2)与C(x3,y3)D(x4,y4)的交点在AB上的位置
  参数描述：
  返回值:设交点为O，返回值为AO/AB，小于0交于A点左侧，大于1交于B点右侧，无穷大为平行，设最大值近似平行
  */
  getOverlapCross (pA, pB, pC, pD) {
    var vecACX = pC[0] - pA[0]
    var vecACY = pC[1] - pA[1]
    var vecADX = pD[0] - pA[0]
    var vecADY = pD[1] - pA[1]
    var vecABX = pB[0] - pA[0]
    var vecABY = pB[1] - pA[1]
    var vecDCX = pC[0] - pD[0]
    var vecDCY = pC[1] - pD[1]
    return (this.vecCross(vecADX, vecADY, vecACX, vecACY) / this.vecCross(vecABX, vecABY, vecDCX, vecDCY))
  }
  /*
 方法名称：getDistancePointTOLine
   功能描述：获取点到线段的距离
   参数描述：
   x：X坐标
   y：Y坐标

   返回值:点到线段的距离及交点
*/
  getDistancePointTOLine (x, y, x1, y1, x2, y2) { // x,y为点的位置,矢量法
    var pointObject = {}
    var cross = (x2 - x1) * (x - x1) + (y2 - y1) * (y - y1)
    if (cross <= 0) {
      pointObject.x = x1
      pointObject.y = y1
      pointObject.dis = Math.pow((x - x1) * (x - x1) + (y - y1) * (y - y1), 0.5)
      return pointObject
    }
    var d2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1)
    if (cross >= d2) {
      pointObject.x = x2
      pointObject.y = y2
      pointObject.dis = Math.pow((x - x2) * (x - x2) + (y - y2) * (y - y2), 0.5)
      return pointObject
    }
    var r = cross / d2
    var px = x1 + (x2 - x1) * r
    var py = y1 + (y2 - y1) * r
    pointObject.x = px
    pointObject.y = py
    pointObject.dis = Math.pow((x - px) * (x - px) + (py - y) * (py - y), 0.5)
    return pointObject
  }
  /*
方法名称：getLineInsect
 功能描述：获取本多边形内与点point距离小于dis的边与交点
 参数描述：
 point：地图上的点
 dis：最小距离

 返回值:点到线段的距离及交点
*/
  getLineInsect (point, dis) {
    var pointObject = null
    var polygonLines = this.getPolygonLine()
    var pC = null
    var pD = null
    for (let i = 0; i < polygonLines.length; i++) {
      pC = [polygonLines[i].S.x, polygonLines[i].S.y]
      pD = [polygonLines[i].E.x, polygonLines[i].E.y]
      pointObject = this.getDistancePointTOLine(point.lng, point.lat, pC[0], pC[1], pD[0], pD[1])
      if (pointObject.dis < dis) {
        return pointObject
      }
    }
    return pointObject
  }
}
export default MyPolygon

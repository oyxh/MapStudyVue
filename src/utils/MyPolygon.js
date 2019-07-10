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
      var linesGap = (bounds.maxY - bounds.minY) / 2 / (pointsNum - 1)
      for (var i = 0; i < pointsNum; i++) {
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

      }
    }
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
     方法名称：getOverlapCount
     功能描述：获取指定线段与线段数组里面相交的线段(不包括斜率一致的)
     参数描述：
     line：指定线段
     lineList：线段数组
     返回值:返回相交的线段
     */
  getOverlapCount (line, lineList) {
    var len = lineList.length,
      item = null,
      OverlapLine = []
    for (var i = 0; i < len; i++) {
      item = lineList[i]
      if (this.isOverlapping(line, item) && this.isEqualK(line, item) == false) {
        OverlapLine.push(item)
      }
    }
    return OverlapLine
  }
  /*
   方法名称：isEqualK
   功能描述：判断斜率是否一致
   参数描述：
   lineA：线段A
   lineB：线段B
   返回值:
    true:一致
    false:不一致
   */
  isEqualK (lineA, lineB) {
    var lineAK = this.getLineK(lineA.S.x, lineA.S.y, lineA.E.x, lineA.E.y)
    var lineBK = this.getLineK(lineB.S.x, lineB.S.y, lineB.E.x, lineB.E.y)
    return lineAK == lineBK
  }
  /*
   方法名称：isOverlapping
   功能描述：判断两个线段是否相交
   参数描述：
   lineA：线段A
   lineB：线段B
   返回值:
   true：交叉
   false：不交叉
   判断依据:1：判断两条线段的端点是否存在在彼此之上的情况,2：判断两个线段的两个端点是否都在彼此的两边
   */
  isOverlapping (lineA, lineB) {
    var lineAStartPointInLineB = this.isPointInLine(lineA.S, lineB.S, lineB.E)
    var lineAEndPointInLineB = this.isPointInLine(lineA.E, lineB.S, lineB.E)
    var lineBStartPointInLineA = this.isPointInLine(lineB.S, lineA.S, lineA.E)
    var lineBEndPointInLineA = this.isPointInLine(lineB.E, lineA.S, lineA.E)
    // 只要有一点在另外一条线上我们就认为相交,也就是两条直线相交
    if (lineAStartPointInLineB == 0 || lineAEndPointInLineB == 0 || lineBStartPointInLineA == 0 || lineBEndPointInLineA == 0) {
      return true
    }
    // 如果上面条件不满足,点都不在对应的线段上,但是有一个点在另外一条线的延长线上,说明一定不会相交
    if (lineAStartPointInLineB == -2 || lineAEndPointInLineB == -2 || lineBStartPointInLineA == -2 || lineBEndPointInLineA == -2) {
      return false
    }
    // 因为在上面是1,在下面是-1,两个相乘如果小于0则一定在两边,如果两条线段的两个端点分别在对应线段的两端,说明相交
    if (lineAStartPointInLineB * lineAEndPointInLineB < 1 && lineBStartPointInLineA * lineBEndPointInLineA < 1) {
      return true
    }
    return false// 默认不相交
  }
  /*
   方法名称：isPointInLine
   功能描述：判断点point是否在以linePS为起点,linePE为终点的线段上
   参数描述：
   point：点
   linePS：线段起点
   linePE：线段终点
   返回值:
   0：在线段上
   1：不在线段上，而是在线段的上方
   -1：不在线段上，而是在线段的下方
   -2:不在线段上，而是在线段所在的直线上
   */
  isPointInLine (point, linePS, linePE) {
    var maxLineX = 0,
      minLineX = 0,
      maxLineY = 0,
      minLineY = 0,
      K = this.getLineK(linePS.x, linePS.y, linePE.x, linePE.y)
    var B = this.getLineB(linePS.x, linePS.y, K)
    var linePointY = (K * point.x + B)
    if (linePS.x < linePE.x) {
      maxLineX = linePE.x; minLineX = linePS.x
    } else {
      maxLineX = linePS.x; minLineX = linePE.x
    }
    if (linePS.y < linePE.y) {
      maxLineY = linePE.y; minLineY = linePS.y
    } else {
      maxLineY = linePS.y; minLineY = linePE.y
    }
    if (point.x >= minLineX && point.x <= maxLineX && point.y >= minLineY && point.y <= maxLineY) { // 在线段所在的矩形范围之内
      if (linePointY == point.y) {
        return 0
      } else if (linePointY > point.y) {
        if (point.y >= 0) {
          return -1
        } else {
          return 1
        }
      } else {
        if (point.y >= 0) {
          return 1
        } else {
          return -1
        }
      }
    } else {
      if (linePointY == point.y) {
        return -2
      } else if (linePointY > point.y) {
        if (point.y >= 0) {
          return -1
        } else {
          return 1
        }
      } else {
        if (point.y >= 0) {
          return 1
        } else {
          return -1
        }
      }
    }
  }
  /*
   方法名称：getLineK
   功能描述：获取线段的斜率
   参数描述：
   x1：X坐标1
   y1：Y坐标1
   x2：X坐标2
   y2：Y坐标2
   返回值:斜率
   */
  getLineK (x1, y1, x2, y2) {
    return (y1 - y2) / (x1 - x2)
  }
  /*
   方法名称：getLineB
   功能描述：获取线段的y轴截距
   参数描述：
   x1：X坐标1
   y1：Y坐标1
   k：斜率
   返回值:线段的y轴截距
   */
  getLineB (x1, y1, k) {
    return y1 - k * x1
  }
  get pointData () {
    return this._pointData
  }
  set pointData (pointData) {
    this._pointData = pointData
  }
}
export default MyPolygon

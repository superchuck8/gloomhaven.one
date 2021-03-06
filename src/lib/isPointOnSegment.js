export const isPointOnSegment = (startPoint, checkPoint, endPoint) => {
  if ((
    startPoint.x === checkPoint.x && checkPoint.x === endPoint.x &&
    (
      startPoint.y > checkPoint.y && checkPoint.y > endPoint.y ||
      startPoint.y < checkPoint.y && checkPoint.y < endPoint.y
    )
  ) || (
    startPoint.y === checkPoint.y && checkPoint.y === endPoint.y &&
    (
      startPoint.x > checkPoint.x && checkPoint.x > endPoint.x ||
      startPoint.x < checkPoint.x && checkPoint.x < endPoint.x
    )
  )) {
    return true
  }

  return (
    (Math.abs((endPoint.y - startPoint.y) * (checkPoint.x - startPoint.x)) + .5 | 0) ===
    (Math.abs((checkPoint.y - startPoint.y) * (endPoint.x - startPoint.x)) + .5 | 0)
    &&
    (
      (startPoint.x > checkPoint.x && checkPoint.x > endPoint.x) ||
      (startPoint.x < checkPoint.x && checkPoint.x < endPoint.x)
    )
    &&
    (
      (startPoint.y >= checkPoint.y && checkPoint.y >= endPoint.y) ||
      (startPoint.y <= checkPoint.y && checkPoint.y <= endPoint.y)
    )
  )
}

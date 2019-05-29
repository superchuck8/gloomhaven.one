import {
  board,
  cornersCoordinates
}                     from './lib/board/board'
import {
  toPoint,
  addPoint
}                     from './lib/hexUtils'
import {isInSight}    from './lib/isInSight'
import                     './lib/testWebp'
import                     './style.css'


const canvas = document.getElementById('c')
const ctx = canvas.getContext('2d')
const applyStyle = (style, hex) => typeof style === 'function' ? style(hex) : style

const renderer = () => {
  if (!board.scenario) {
    return
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  let linesToHover = false
  let hoverHex = false
  const style = board.scenario.style

  if ('noHexes' in style) {
    board.grid
      .filter(gridHex => !board.scenario.hexes.find(hex => hex.x === gridHex.x && hex.y === gridHex.y))
      .filter(gridHex => !board.scenario.wallHexes.find(hex => hex.x === gridHex.x && hex.y === gridHex.y))
      .forEach(gridHex => {
        const [firstCorner, ...otherCorners] = addPoint(cornersCoordinates, toPoint(gridHex))

        ctx.beginPath()
        ctx.moveTo(firstCorner.x, firstCorner.y)
        otherCorners.forEach(({x, y}) => ctx.lineTo(x, y))
        ctx.lineTo(firstCorner.x, firstCorner.y)
        if (style.noHexes.line) {
          ctx.strokeStyle = applyStyle(style.noHexes.line, gridHex)
          ctx.stroke()
        }
      })
  }

  board.scenario.wallHexes.forEach(wallHex => {
    const [firstCorner, ...otherCorners] = addPoint(cornersCoordinates, toPoint(wallHex))

    if (style.wallHexes) {
      ctx.beginPath()
      ctx.moveTo(firstCorner.x, firstCorner.y)
      otherCorners.forEach(({x, y}) => ctx.lineTo(x, y))
      ctx.lineTo(firstCorner.x, firstCorner.y)
      if (style.wallHexes.line) {
        ctx.strokeStyle = style.wallHexes.line
        ctx.stroke()
      }
      if (style.wallHexes.fill) {
        ctx.fillStyle = applyStyle(style.wallHexes.fill, wallHex)
        ctx.fill()
      }
    }

    // Shade wall hexes always when player is on the board
    if (board.playerHex) {
      ctx.beginPath()
      ctx.moveTo(firstCorner.x, firstCorner.y)
      otherCorners.forEach(({x, y}) => ctx.lineTo(x, y))
      ctx.lineTo(firstCorner.x, firstCorner.y)
      ctx.fillStyle = '#000a'
      ctx.fill()
    }
  })

  board.scenario.hexes.forEach(hex => {
    const [firstCorner, ...otherCorners] = addPoint(cornersCoordinates, toPoint(hex))

    ctx.beginPath()
    ctx.moveTo(firstCorner.x, firstCorner.y)
    otherCorners.forEach(({x, y}) => ctx.lineTo(x, y))
    ctx.lineTo(firstCorner.x, firstCorner.y)

    if (style.hexes) {
      if (style.hexes.line) {
        ctx.strokeStyle = style.hexes.line
        ctx.stroke()
      }

      if (style.hexes.fill) {
        ctx.fillStyle = style.hexes.fill
        ctx.fill()
      }
    }

    ctx.closePath()

    let isMouseHex = hex.x === board.mouseHex.x && hex.y === board.mouseHex.y
    let responseToisInSight = board.playerHex && isInSight(board.playerHex, hex, isMouseHex)

    if (isMouseHex && responseToisInSight instanceof Array) {
      linesToHover = responseToisInSight
    }

    // Line of sight
    if (responseToisInSight === false) {
      ctx.fillStyle = '#000a'
      ctx.fill()
    }

    // Hex hover
    if (hex.x === board.mouseHex.x && hex.y === board.mouseHex.y) {
      if (style.hexHover) {
        ctx.fillStyle = applyStyle(style.hexHover)
        ctx.fill()
      }
      hoverHex = true
    }

    // Player
    if (board.playerHex && hex.x === board.playerHex.x && hex.y === board.playerHex.y) {
      ctx.fillStyle = '#00f8'
      ctx.fill()
    }
  })

  // Numbers on hexes
  // ctx.font = '14px Arial'
  // board.grid.forEach(gridHex => {
  //   const firstCorner = addPoint(cornersCoordinates, toPoint(gridHex))[0]
  //
  //   ctx.fillStyle = '#000'
  //   ctx.fillText(`${gridHex.x}, ${gridHex.y}`, firstCorner.x - 61, firstCorner.y - 23)
  //   ctx.fillStyle = '#fff'
  //   ctx.fillText(`${gridHex.x}, ${gridHex.y}`, firstCorner.x - 60, firstCorner.y - 22)
  // })

  // noHex hover
  if (
    !hoverHex &&
    board.mouseHex &&
    style.noHexHover
  ) {
    if (board.mouseHex.x !== null && board.mouseHex.y !== null) {
      const [firstCorner, ...otherCorners] = addPoint(cornersCoordinates, toPoint(board.mouseHex))

      ctx.beginPath()
      ctx.moveTo(firstCorner.x, firstCorner.y)
      otherCorners.forEach(({x, y}) => ctx.lineTo(x, y))
      ctx.lineTo(firstCorner.x, firstCorner.y)

      ctx.fillStyle = applyStyle(style.noHexHover)
      ctx.fill()
    }
  }

  if (style.thinWalls) {
    ctx.lineWidth = style.thinWalls.width
    ctx.strokeStyle = style.thinWalls.line
    board.scenario.thinWalls.forEach(thinWall => {
      ctx.beginPath()
      ctx.moveTo(thinWall.x1, thinWall.y1)
      ctx.lineTo(thinWall.x2, thinWall.y2)
      ctx.stroke()
    })
    ctx.lineWidth = 1
  }

  // Draw walls
  // if (renderDebug) {
  //   ctx.strokeStyle = '#fff'
  //   ctx.lineWidth = 1
  //   board.scenario.walls.forEach(wall => {
  //     ctx.beginPath()
  //     ctx.moveTo(wall.x1, wall.y1)
  //     ctx.lineTo(wall.x2, wall.y2)
  //     ctx.stroke()
  //   })
  // }

  if (linesToHover) {
    let shortestLine = linesToHover.reduce((acc, line) => {
      line.len = Math.sqrt(((line.x - line.a) ** 2) + ((line.y - line.b) ** 2))
      if (!acc || line.len < acc.len) {
        acc = line
      }
      return acc
    }, false)

    // linesToHover.forEach(line => {
    ctx.beginPath()
    ctx.moveTo(shortestLine.a, shortestLine.b)
    ctx.lineTo(shortestLine.x, shortestLine.y)
    ctx.lineWidth = 3
    ctx.strokeStyle = '#f0fe'
    ctx.stroke()
    ctx.lineWidth = 1
    // })
  }
}

export const render = () => requestAnimationFrame(renderer)

render()

// const scenarioSelect = document.getElementById('scenario')
// for (let [id, scenario] of Object.entries(scenarioList)) {
//   const option = document.createElement('option')
//   option.value = id
//   option.innerText = scenario.name
//   scenarioSelect.appendChild(option)
// }
//
// scenarioSelect.addEventListener('change', event => {
//   const value = event.target.value
//   board.loadScenario(value)
//
//   window.location.hash = value === 'editor' ? ':' : value
// })
//
// let loadScenario = 'editor'
//
// if (window.location.hash) {
//   if (window.location.hash.match(/^#\d+/)) {
//     loadScenario = window.location.hash.substr(1)
//   } else if (window.location.hash.substr(0, 2) === '#:') {
//     loadScenario = 'editor'
//   }
// }
//
// scenarioSelect.value = loadScenario
board.loadScenario()

canvas.addEventListener('click', event => board.events('click', event))
canvas.addEventListener('mousedown', event => board.events('mousedown', event))
canvas.addEventListener('mousemove', event => board.events('mousemove', event))
canvas.addEventListener('mouseup', event => board.events('mouseup', event))
canvas.addEventListener('mouseout', event => board.events('mouseup', event))

// document.getElementById('los-mode').addEventListener('change', event => {
//   board.losMode = event.target.value === '1'
//   render()
// })

// const fullLOSTest = () => {
//   let inSight = 0
//   let outSight = 0
//
//   let start = window.performance.now()
//
//   const hexesToTest = board.scenario.hexes
//
//   hexesToTest.forEach(hex => {
//     hexesToTest.forEach(hex2 => {
//       if (hex.x !== hex2.x || hex.y !== hex2.y) {
//         if (isInSight(hex, hex2)) {
//           ++inSight
//         } else {
//           ++outSight
//         }
//       }
//     })
//   })
//   let end = window.performance.now()
//
//   console.log(`Full LOS test: In sight ${inSight} / Out of sight ${outSight}. Test took ${(end - start | 0)}ms.`)
// }
//
// setTimeout(fullLOSTest, 200)

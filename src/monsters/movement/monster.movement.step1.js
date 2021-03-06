import {countTrapsInPath} from '../focus/monsters.focus.functions'
import {monsterValues}    from '../monsters.controls'
import {board}            from '../../board/board'
import {getHexRange}      from '../../lib/getHexRange'
import {getPath}          from '../../lib/getPath'


export const getPossibleMovementTargets = (monster, focus) => {
  let allowedMovemenetTargets = ['monster', 'player']
  if (monsterValues.mt < 2) {
    allowedMovemenetTargets.push('obstacle')
  }

  /*
   * ## MOVEMENT RESOLVE STEP 1.1
   *   - Get range of hexes that is within range of monster's move value.
   *   - This does not match actual movement cost.
   *   - Filter occupied hexes out.
   */

  let movementTargets = getHexRange(monster.ch, monsterValues.move)
    .filter(hex =>
      !board.items.some(item =>
        item !== monster &&
        item.ch.x === hex.x &&
        item.ch.y === hex.y &&
        allowedMovemenetTargets.includes(item.type)
      )
    )

  /*
   * ## MOVEMENT RESOLVE STEP 1.2
   *   - If focus was done without need to step to traps, filter hexes with traps from potential
   *     movement targets.
   */

  if (!focus.traps && monsterValues.mt < 2) {
    movementTargets = movementTargets.filter(hex =>
      !board.items.some(item =>
        item.ch.x === hex.x &&
        item.ch.y === hex.y &&
        item.type === 'trap'
      )
    )
  }

  /*
   * ## MOVEMENT RESOLVE STEP 1.3
   *   - use getPath() to get the actual path to every potential movement target. Then filter out
   *     any movement targets that are too far away to reach with current movement points.
   *   - Filter out also path with too many traps.
   */

  movementTargets = movementTargets.filter(movementTarget => {
    const pathFilterItems = []

    if (monsterValues.mt === 0) {
      pathFilterItems.push('obstacle', 'player')

      if (!focus.traps) {
        pathFilterItems.push('trap')
      }
    }

    const path = getPath(monster.ch, movementTarget, pathFilterItems, monsterValues.mt)

    if (
      focus.traps &&
      monsterValues.mt === 0 &&
      countTrapsInPath(path) > focus.traps
    ) {
      return false
    }

    if (path.pathLength <= monsterValues.move) {
      movementTarget.path = path
      return true
    }
  })

  return movementTargets
}


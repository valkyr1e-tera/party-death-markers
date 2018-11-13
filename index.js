module.exports = function PartyDeathMarkers(mod) {
  let members = []

  mod.game.on('enter_game', removeAllMarkers)

  mod.hook('S_PARTY_MEMBER_LIST', 7, event => {
    members = event.members
  })

  mod.hook('S_DEAD_LOCATION', 2, event => {
    spawnMarker(members.find(member => member.gameId.equals(event.gameId)), event.loc)
  })

  mod.hook('S_SPAWN_USER', 13, event => {
    if (!event.alive)
      spawnMarker(members.find(member => member.gameId.equals(event.gameId)), event.loc)
  })

  mod.hook('S_PARTY_MEMBER_STAT_UPDATE', 3, event => {
    if (mod.game.me.playerId === event.playerId)
      return

    if (event.curHp > 0)
      removeMarker(members.find(member => member.playerId === event.playerId))
  })

  mod.hook('S_LEAVE_PARTY_MEMBER', 2, event => {
    removeMarker(members.find(member => member.playerId === event.playerId))
  })

  mod.hook('S_LEAVE_PARTY', 1, () => {
    removeAllMarkers()
    members = []
  })

  function spawnMarker(member, loc) {
    if (!member)
      return

    removeMarker(member)
    mod.toClient('S_SPAWN_DROPITEM', 6, {
      gameId: member.gameId,
      loc: loc,
      item: getMarker(member.class),
      amount: 1,
      expiry: 999999,
      owners: [{playerId: mod.game.me.playerId}]
    })
  }

  function getMarker(classid) {
    switch (classid) {
      case 1:
      case 10:
        return 91177
      case 6:
      case 7:
        return 91113
      default:
        return 98260
    }
  }

  function removeMarker(member) {
    mod.toClient('S_DESPAWN_DROPITEM', 4, {
      gameId: member.gameId
    })
  }

  function removeAllMarkers() {
    members.forEach(member => removeMarker(member))
  }
}
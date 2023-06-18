import { createSelector } from 'reselect'

export const selectUserTournament = createSelector(
  (state, tournamentId) => tournamentId,
  state => state.user.tournaments,
  (id, tournaments) => tournaments[id]
)
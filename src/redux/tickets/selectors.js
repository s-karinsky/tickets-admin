import { createSelector } from 'reselect'

export const getMatchTickets = createSelector(
  state => state.tickets.ticketsByMatch,
  (state, matchId) => matchId,
  (ticketsByMatch, matchId) => matchId ?
    ticketsByMatch[matchId] :
    Object.values(ticketsByMatch).filter(item => item.tickets.length > 0)
)
import axios from '../../utils/axios'
import { setTicketByMatch, setLoading } from '.'

function parseTrips(trips) {
  return trips ? Object.values(trips)
    .filter(trip =>
      trip.t_options &&
      (trip.t_options.price || []).length > 0 &&
      Object.values(trip.t_options.seats_sold || {}).length > 0
    )
    .reduce((acc, trip) => {
      const { t_id, t_create_datetime, t_start_address, t_options } = trip
      const matchId = t_start_address.split('sc_id\x00')[1]
      if (!acc[matchId]) {
        acc[matchId] = {
          matchId,
          tickets: []
        }
      }

      const seatsSold = t_options.seats_sold || {}
      const prices = t_options.price
      const tickets = []
      Object.keys(seatsSold)
        .forEach(block => {
          if (typeof seatsSold[block] !== 'object') return
          Object.keys(seatsSold[block]).forEach(row => {
            if (typeof seatsSold[block][row] !== 'object') return
            Object.keys(seatsSold[block][row]).forEach(seat => {
              const seatValues = seatsSold[block][row][seat]
              const priceIndex = seatValues[0]
              const soldToUser = seatValues[1] || null
              if (priceIndex !== 0 && !priceIndex) return
              const price = prices[priceIndex]
              const [ priceValue, priceCurrency ] = price.split(' ')
              const ticket = {
                tripId: t_id,
                created: t_create_datetime,
                block,
                row,
                price: `${parseFloat(priceValue).toFixed(2)}`,
                currency: priceCurrency,
                soldToUser
              }
              if (seat.includes(';')) {
                const [ rangeStart, rangeEnd ] = seat.split(';').map(Number)
                for (var i = rangeStart; i <= rangeEnd; i++) {
                  tickets.push({ ...ticket, seat: i })
                }
              } else {
                tickets.push({ ...ticket, seat })
              }
            })
          })
        })
      acc[matchId].tickets = acc[matchId].tickets.concat(tickets)
      return acc
    }, {}) : {}
}

export const fetchTicketGroups = async (dispatch) => {
  dispatch(setLoading(true))
  try {
    const res = await axios.postWithAuth('/trip')
    const tripsByMatch = parseTrips(res.data?.data?.trip)
    // const matchList = Object.values(tripsByMatch).filter(item => item.tickets.length > 0)

    dispatch(setTicketByMatch(tripsByMatch))
  } catch (e) {
    console.error(e)
  } finally {
    dispatch(setLoading(false))
  }
}

export const fetchAllTickets = async (dispatch) => {
  dispatch(setLoading(true))
  try {
    const res = await axios.postWithAuth('/trip/get')
    const tripsByMatch = parseTrips(res.data?.data?.trip)
    
    dispatch(setTicketByMatch(tripsByMatch))
  } catch (e) {
    console.error(e)
  } finally {
    dispatch(setLoading(false))
  }
}
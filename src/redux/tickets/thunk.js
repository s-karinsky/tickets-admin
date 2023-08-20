import dayjs from 'dayjs'
import axios from '../../utils/axios'
import { setTicketGroups, setLoading } from '.'

export const fetchTicketGroups = async (dispatch) => {
  dispatch(setLoading(true))
  try {
    const res = await axios.postWithAuth('/trip')
    const trips = Object.values(res.data?.data?.trip)
      .filter(trip =>
        trip.t_options &&
        (trip.t_options.price || []).length > 0 &&
        Object.values(trip.t_options.seats_sold || {}).length > 0
      )
      .map(trip => ({
        id: trip.t_id,
        matchId: trip.t_start_address.split('sc_id\x00')[1],
        created: trip.t_create_datetime,
        tickets: Object.keys(trip.t_options.seats_sold || {}).map(key => {
          const [ stadiumId, block, row, seat ] = key.split(';')
          const priceIndex = trip.t_options.seats_sold[key][0]
          const price = parseFloat(trip.t_options.price[priceIndex])
          return {
            stadiumId,
            block,
            row,
            seat,
            price
          }
        })
      }))
      .sort((a, b) => dayjs(a.created).isBefore(dayjs(b.created) ? 1 : -1))

    dispatch(setTicketGroups(trips))
  } catch (e) {
    console.error(e)
  } finally {
    dispatch(setLoading(false))
  }
}
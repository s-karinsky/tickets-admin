import axios from './axios'

export const getSendings = async () => {
  const response = await axios.postWithAuth('/query/select', { sql: 'SELECT * FROM trip' })
  const data = response.data?.data || []
  return data.map(item => {
    let json
    try {
      json = JSON.parse(item.json)
    } catch (e) {
      json = {}
    }
    return {
      code: item.id_trip,
      date: item.create_datetime,
      transporter: json.transporter,
      status: json.status,
      count: json.count_places,
      weight: json.gross_weight,
      departure: item.start_datetime,
      delivery: item.complete_datetime
    }
  })
}
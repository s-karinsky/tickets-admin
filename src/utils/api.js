import dayjs from 'dayjs'
import { get as _get } from 'lodash'
import axios from './axios'
import { sqlUpdate } from './sql'

export const getSendings = isAir => async () => {
  const [ response, responseProducts ] = await Promise.all([
    axios.postWithAuth('/query/select', { sql: `SELECT * FROM trip WHERE \`to\`='${Number(isAir)}' AND canceled=0` }),
    axios.postWithAuth('/query/select', { sql: `SELECT id_trip, sum(JSON_EXTRACT(n.pole,'$.gross_weight')) AS gross_weight, sum(JSON_EXTRACT(n.pole,'$.net_weight')) AS net_weight, sum(JSON_EXTRACT(n.pole,'$.count')) AS count FROM trip t LEFT JOIN dataset m ON m.id_ref=t.id_trip LEFT JOIN dataset n ON n.id_ref=m.id WHERE canceled=0 AND \`to\`=0 GROUP BY id_trip` })
  ])
  
  const productsMap = (responseProducts.data?.data || []).reduce((acc, item) => ({
    ...acc,
    [item.id_trip]: item
  }), {})

  const data = response.data?.data || []
  return data.map(item => {
    let json
    try {
      json = JSON.parse(item.json.replaceAll("\n", ''))
    } catch (e) {
      console.warn(e)
      json = {}
    }

    return {
      id: item.id_trip,
      code: item.from,
      date: item.create_datetime,
      transporter: json.transporter,
      status: json.status,
      count: productsMap[item.id_trip]?.count || 0,
      weight: productsMap[item.id_trip]?.gross_weight || 0,
      departure: item.start_datetime,
      delivery: item.complete_datetime,
      json
    }
  })
}

export const getSendingById = sendingId => async () => {
  if (sendingId === 'create') {
    const response = await axios.postWithAuth('/query/select', { sql: `SELECT max(\`from\`) FROM trip WHERE YEAR(create_datetime) = YEAR('${dayjs().format('YYYY-MM-DD')}')` })
    const data = response.data?.data || []
    const number = parseInt(_get(data, [0, 'max(`from`)'])) || 0
    return {
      from: number + 1,
      create_datetime: dayjs(),
      json: {
        status: 0
      }
    }
  } else {
    const [ response, responseProducts ] = await Promise.all([
      axios.postWithAuth('/query/select', { sql: `SELECT * FROM trip WHERE id_trip=${sendingId}` }),
      axios.postWithAuth('/query/select', { sql: `SELECT id_trip, sum(JSON_EXTRACT(n.pole,'$.gross_weight')) AS gross_weight, sum(JSON_EXTRACT(n.pole,'$.net_weight')) AS net_weight, sum(JSON_EXTRACT(n.pole,'$.count')) AS count FROM trip t LEFT JOIN dataset m ON m.id_ref=t.id_trip LEFT JOIN dataset n ON n.id_ref=m.id WHERE m.ref_tip='sending' AND m.id_ref=${sendingId} AND m.status=0 GROUP BY id_trip` })
    ])
    const products = (responseProducts.data?.data || [])[0] || {}
    const item = (response.data?.data || [])[0] || {}
    try {
      item.json = JSON.parse(item.json.replaceAll("\n", ''))
    } catch (e) {
      console.warn('Bad sending json')
    }
    item.create_datetime = dayjs(item.create_datetime)
    item.start_datetime = dayjs(item.start_datetime)
    item.complete_datetime = dayjs(item.complete_datetime)
    item.gross_weight = products.gross_weight
    item.net_weight = products.net_weight
    item.count = products.count
    return item
  }
}

export const deleteSendingById = sendingId => async () => {
  const response = await axios.postWithAuth('/query/update', { sql: sqlUpdate('trip', { canceled: 1 }, `id_trip=${sendingId}`) })
  return response
}

export const getPlacesBySendingId = sendingId => async () => {
  const sql = `SELECT * FROM dataset WHERE ref_tip='sending' AND id_ref=${sendingId} AND status=0`
  const response = await axios.postWithAuth('/query/select', { sql })
  const data = response.data?.data || []
  return data.map(item => {
    let json
    try {
      json = JSON.parse(item.pole)
    } catch (e) {
      json = {}
    }
    return {
      ...item,
      ...json
    }
  })
}

export const getPlaceById = placeId => async () => {
  if (placeId === 'create') {
    return {}
  }
  const sql = `SELECT * FROM dataset WHERE id=${placeId}`
  const response = await axios.postWithAuth('/query/select', { sql })
  const data = (response.data?.data || [])[0]
  let json
  try {
    json = JSON.parse(data.pole)
  } catch (e) {
    json = {}
  }
  return {
    ...data,
    ...json
  }
}

export const deletePlaceById = placeId => async () => {
  const response = await axios.postWithAuth('/query/update', { sql: sqlUpdate('dataset', { status: 1 }, `id=${placeId}`) })
  return response
}

export const getProductsByPlaceId = placeId => async () => {
  const response = await axios.postWithAuth('/query/select', {
    sql: `SELECT * FROM dataset WHERE id_ref=${placeId} AND ref_tip='place' AND status=0`
  })
  const data = response.data?.data || []
  return data.map(item => {
    let json
    try {
      json = JSON.parse(item.pole)
    } catch (e) {
      json = {}
    }
    return {
      ...item,
      ...json
    }
  })
}

export const deleteProductById = async (productId) => {
  const response = await axios.postWithAuth('/query/update', { sql: sqlUpdate('dataset', { status: 1 }, `id=${productId}`) })
  return response
}
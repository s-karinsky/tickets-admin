import dayjs from 'dayjs'
import { get as _get, keyBy } from 'lodash'
import { useQuery } from 'react-query'
import Cookies from 'universal-cookie'
import axios from './axios'
import { parseJSON, toFormData } from './utils'
import { sqlUpdate, sqlInsert } from './sql'

const sendingSummaryFields = [
  'id_trip',
  'm.id as place_id',
  'JSON_EXTRACT(m.pole,"$.gross_weight") as gross_weight',
  'JSON_EXTRACT(n.pole,"$.net_weight") as net_weight',
  'JSON_EXTRACT(n.pole,"$.count") as count'
]

export const useAuthorization = ({ token, u_hash }) => useQuery(['authorization', { token, u_hash }], async () => {
  if (!token || !u_hash) return { authorized: false }
  const response = await axios.post('/user/authorized', toFormData({ token, u_hash }))
  const user = response.data?.auth_user
  return user ? {
    authorized: true,
    ...user
  } : {
    authorized: false
  }
}, {
  staleTime: 10 * 60 * 1000
})

export const login = async (values) => {
  const response = await axios.post('/auth', toFormData({ ...values, type: 'e-mail' }))
  const { data } = response
  if (!data.auth_hash || !['2', '4'].includes(data.auth_user?.u_role)) {
    return false
  }
  const responseTokens = await axios.post('/token', toFormData({ auth_hash: data.auth_hash }))
  const tokens = responseTokens.data?.data
  if (tokens) {
    const cookies = new Cookies()
    cookies.set('token', tokens.token)
    cookies.set('u_hash', tokens.u_hash)
  }
  return data.auth_user?.u_role
}

export const getCount = async (db, where) => {
  const response = await axios.select(db, 'count(*) as count', { where })
  const count = _get(response, ['data', 'data', 0, 'count'])
  return count
}

export const getLastId = async (table, id = 'id') => {
  const response = await axios.select(table, `max(${id}) as max`)
  const count = _get(response, ['data', 'data', 0, 'max'])
  return count
}

export const getSendings = isAir => async () => {
  const [ response, responseProducts ] = await Promise.all([
    axios.select('trip', '*', { where: { to: `${Number(isAir)}`, canceled: 0 } }),
    axios.select('trip t', sendingSummaryFields,
      {
        where: {
          canceled: 0,
          to: `${Number(isAir)}`,
          'm.status': 0,
          'n.status': 0
        },
        leftJoin: {
          'dataset m': 'm.id_ref=t.id_trip',
          'dataset n': 'n.id_ref=m.id'
        }
      }
    )
  ])
  
  const placeCountIdsMap = {}
  const productsMap = (responseProducts.data?.data || []).reduce((acc, item) => {
    const id = item.id_trip
    if (!placeCountIdsMap[id]) placeCountIdsMap[id] = []
    const count = Number(item.count)
    const gross_weight = Number(item.gross_weight)
    const net_weight = Number(item.net_weight)
    if (!acc[id]) {
      acc[id] = { count, gross_weight, net_weight }
    } else {
      acc[id].count += count
      acc[id].net_weight += net_weight
    }
    if (!placeCountIdsMap[id].includes(item.place_id)) {
      acc[id].gross_weight += gross_weight
      placeCountIdsMap[id].push(item.place_id)
    }
    return acc
  }, {})

  const data = response.data?.data || []
  return data.map(item => {
    const json = parseJSON((item.json || '').replaceAll("\n", ''))

    return {
      id: item.id_trip,
      code: item.from,
      date: item.create_datetime,
      transporter: json.transporter,
      status: json.status,
      count: productsMap[item.id_trip]?.count || 0,
      net_weight: productsMap[item.id_trip]?.net_weight || 0,
      gross_weight: productsMap[item.id_trip]?.gross_weight || 0,
      places_count: placeCountIdsMap[item.id_trip]?.length || 0,
      departure: item.start_datetime,
      delivery: item.complete_datetime,
      json
    }
  })
}

export const getSendingById = (sendingId, { copy } = {}) => async () => {
  let newNumber
  if (sendingId === 'create') {
    const response = await axios.select('trip', 'max(cast(`from` as decimal)) as max', { where: { canceled: 0, 'YEAR(create_datetime)': `YEAR('${dayjs().format('YYYY-MM-DD')}')` } })
    const data = response.data?.data || []
    newNumber = parseInt(_get(data, [0, 'max'])) || 0
    if (!copy) {
      return {
        from: newNumber + 1,
        create_datetime: dayjs(),
        json: {
          status: 0
        }
      }
    }
  }

  let promises
  if (!copy) {
    promises = await Promise.all([
      axios.select('trip', '*', { where: { id_trip: sendingId } }),
      axios.select('trip t', sendingSummaryFields,
        {
          where: {
            'm.ref_tip': 'sending',
            'm.id_ref': sendingId,
            'm.status': 0,
            'n.status': 0
          },
          leftJoin: {
            'dataset m': 'm.id_ref=t.id_trip',
            'dataset n': 'n.id_ref=m.id'
          }
        }
      )
    ])
  } else {
    promises = await axios.select('trip', '*', { where: { id_trip: copy } })
  }
  let response
  let responseProducts
  if (Array.isArray(promises)) {
    response = promises[0]
    responseProducts = promises[1]
  } else {
    response = promises
    responseProducts = {}
  }

  const placesId = []
  const products = (responseProducts?.data?.data || []).reduce((acc, item) => {
    acc.count += Number(item.count)
    acc.net_weight += Number(item.net_weight)
    if (!placesId.includes(item.place_id)) {
      acc.gross_weight += Number(item.gross_weight)
      placesId.push(item.place_id)
    }
    return acc
  }, {
    count: 0,
    gross_weight: 0,
    net_weight: 0
  })
  const item = (response.data?.data || [])[0] || {}
  item.json = parseJSON((item.json || '').replaceAll("\n", ''))
  
  item.create_datetime = dayjs(item.create_datetime)
  item.start_datetime = item.json?.status > 0 && dayjs(item.json?.status_date_1)
  item.complete_datetime = item.json?.status > 1 && dayjs(item.json?.status_date_2)
  item.gross_weight = products.gross_weight
  item.net_weight = products.net_weight
  item.count = products.count

  if (copy) {
    item.json.status = 0
    item.from = newNumber + 1
  }
  return item
}

export const deleteSendingById = async (sendingId) => {
  const response = await axios.postWithAuth('/query/update', { sql: sqlUpdate('trip', { canceled: 1 }, `id_trip=${sendingId}`) })
  return response
}

export const updateSendingById = async (sendingId, params = {}) => {
  const response = await axios.postWithAuth('/query/update', { sql: sqlUpdate('trip', params, `id_trip=${sendingId}`) })
  return response
}

export const createSending = async (values) => {
  const response = await axios.postWithAuth('/query/insert', { sql: sqlInsert('trip', values) })
  return response
}

export const getPlacesBySendingId = sendingId => async () => {
  if (sendingId === 'create') return []

  const [ response, responseProducts ] = await Promise.all([
    axios.select('dataset p', ['p.*', 's.id as service_id', 's.pole as service'], {
      leftJoin: {
        'dataset s': `JSON_EXTRACT(s.pole, "$.places") LIKE CONCAT('%"', p.id ,'"%') AND s.tip="service" AND JSON_EXTRACT(s.pole, "$.is_finished")=0`
      },
      where: {
        'p.ref_tip': 'sending',
        'p.id_ref': sendingId,
        'p.status': 0
      }
    }),
    axios.select('dataset t', ['t.id', 'JSON_EXTRACT(n.pole,"$.mark") as mark', 'sum(JSON_EXTRACT(n.pole,"$.gross_weight")) AS gross_weight', 'sum(JSON_EXTRACT(n.pole,"$.count")) AS count'], {
      where: {
        't.tip': 'place',
        't.id_ref': sendingId,
        't.status': 0
      },
      leftJoin: {
        'dataset n': 'n.id_ref=t.id'
      },
      groupBy: 't.id'
    })
  ])
  const productsList = (responseProducts.data?.data || [])
  const productsMap = productsList.reduce((acc, item) => ({
    ...acc,
    [item.id]: item
  }), {})
  
  const data = response.data?.data || []
  return data.map(item => {
    const json = parseJSON(item.pole)
    const service = parseJSON(item.service)
    return {
      ...item,
      ...json,
      count: productsMap[item.id]?.count,
      hasMark: productsMap[item.id]?.mark === 'true',
      service
    }
  })
}

export const getPlaceById = (placeId, sendingId, params = {}) => async () => {
  let values = {}
  if (placeId === 'create') {
    const response = await axios.select('dataset', 'max(cast(JSON_EXTRACT(pole,"$.place") as decimal)) as max', { where: { id_ref: sendingId, ref_tip: 'sending' } })
    values = {
      place: parseInt(_get(response, ['data', 'data', 0, 'max']) || 0) + 1
    }
    if (!params.copy) return values
  }
  let sql
  if (params.copy) {
    sql = `SELECT * FROM dataset WHERE id=${params.copy}`
  } else {
    sql = `SELECT p.*, s.pole as service FROM dataset p LEFT JOIN dataset s ON JSON_EXTRACT(s.pole, "$.places") LIKE CONCAT('%"', p.id ,'"%') AND s.tip='service' AND JSON_EXTRACT(s.pole, '$.is_finished')=0 WHERE p.id=${placeId}`
  }
  const response = await axios.postWithAuth('/query/select', { sql })
  const data = (response.data?.data || [])[0]
  const json = parseJSON(data.pole)
  const service = parseJSON(data.service)
  return {
    ...data,
    ...json,
    ...values,
    service
  }
}

export const getDatasetsById = (ids, withChildren) => async () => {
  if (!ids || !Array.isArray(ids)) return []
  const where = ids.map(id => `d.id=${id}`).join(' OR ')
  const response = await axios.postWithAuth('/query/select', { sql: `SELECT d.*, t.from as sending_number, t.json as sending, t.start_datetime as sendingDate FROM dataset d LEFT JOIN trip t ON t.id_trip=d.id_ref WHERE ${where}` })

  let child = []
  if (withChildren) {
    const childResponse = await axios.select('dataset', '*', { where: ids.map(id => `id_ref=${id}`).join(' OR ') })
    child = (childResponse.data?.data || []).map(item => ({
      ...item,
      ...parseJSON(item.pole),
      pole: parseJSON(item.pole)
    }))
  }

  const data = response.data?.data || []
  return data.map(item => ({
    ...item,
    ...parseJSON(item.pole),
    sending: parseJSON(item.sending),
    pole: parseJSON(item.pole),
    child: child.filter(sub => sub.id_ref === item.id)
  }))
}

export const deletePlaceById = async (placeId) => {
  const response = await axios.postWithAuth('/query/update', { sql: sqlUpdate('dataset', { status: 1 }, `id=${placeId}`) })
  return response
}

export const updateDatasetById = async (placeId, params = {}) => {
  const response = await axios.postWithAuth('/query/update', { sql: sqlUpdate('dataset', params, `id=${placeId}`) })
  return response.data
}

export const createDataset = async (params) => {
  const response = await axios.postWithAuth('/query/insert', { sql: sqlInsert('dataset', params) })
  return response.data
}

export const getProductsByPlaceId = placeId => async () => {
  const response = await axios.postWithAuth('/query/select', {
    sql: `SELECT * FROM dataset WHERE id_ref=${placeId} AND ref_tip='place' AND tip='product' AND status=0`
  })
  const data = response.data?.data || []
  return data.map(item => {
    const json = parseJSON(item.pole)
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

export const useUsers = (userId, where, params) => useQuery(['users', userId, where], async () => {
  if (typeof userId === 'object' && !where) {
    where = userId
    userId = null
  }

  if (userId === 'create') {
    return {
      id_role: '1'
    }
  }

  const response = await axios.select('users', '*', { where: { active: 1, deleted: 0, id_user: userId, ...where } })
  const users = (response.data?.data || []).map(user => {
    if (!user.json) {
      user.json = {}
    } else {
      user.json = parseJSON(user.json)
    }
    return user
  })
  return userId ? users[0] : users
}, params)

export const useUsersWithRole = (role, params) => useQuery(['usersWithRole', role], async () => {
  const response = await axios.postWithAuth('/query/select', { sql: `SELECT id_user, name, family, middle, json, phone FROM users WHERE id_role=${role} AND active=1 AND deleted!=1` })
  const users = (response.data?.data || []).map(user => {
    user.json = parseJSON(user.json)
    return user
  })
  return users
}, params)

export const updateUserById = async (userId, values = {}) => {
  const response = await axios.postWithAuth('/query/update', { sql: sqlUpdate('users', values, `id_user=${userId}`) })
  return response
}

export const createUser = async (values) => {
  await axios.postWithAuth('/query/insert', { sql: sqlInsert('users', values) })
  const lastId = await getLastId('users', 'id_user')
  return lastId
}

export const useCountries = () => useQuery('countries', async () => {
  const response = await axios.postWithAuth('/query/select', { sql: `SELECT \`ISO 3166-1 alpha-2 code\` as value, country_name_ru as label FROM countries_list WHERE active=1 ORDER BY country_name_ru` })
  let list = _get(response, ['data', 'data']) || []
  const ru = list.find(item => item.value === 'ru')
  const by = list.find(item => item.value === 'by')
  list = list.filter(item => !['ru', 'by'].includes(item.value))
  list = [ru, by].filter(Boolean).concat(list)
  const map = keyBy(list, 'value')
  return { map, list }
}, {
  staleTime: 10 * 60 * 1000
})

export const useAllCities = () => useQuery(['cities'], async () => {
  const response = await axios.postWithAuth('/query/select', { sql: `SELECT id_city as value, country, name_ru as label FROM city ORDER BY name_ru` })
  const list = _get(response, ['data', 'data']) || []
  const map = keyBy(list, 'value')
  return { map, list }
})

export const useCities = (country) => useQuery(['cities', country], async () => {
  const response = await axios.postWithAuth('/query/select', { sql: `SELECT id_city as value, country, name_ru as label FROM city WHERE country='${country}' ORDER BY name_ru` })
  const list = _get(response, ['data', 'data']) || []
  const map = keyBy(list, 'value')
  return { map, list }
}, {
  enabled: !!country
})

export const useDictionary = (name, where, params) => useQuery(['dictionary', name, where], async () => {
  if (name === 'currency') {
    const response = await axios.select('currency', 'iso4217_code_a as id, name_ru as name', { orderBy: 'iso4217_code_a' })
    return { list: response.data?.data || [] }
  }

  if (where && where.id === 'create') {
    return {

    }
  }

  const response = await axios.select('sprset', '*', { where: { status: 0, tip: name, ...where } })
  const list = (_get(response, ['data', 'data']) || []).map(item => {
    let json = parseJSON(item.pole)

    if (name === 'drivers') {
      json.label = `${json.value} (${[json.family, json.name, json.middle].filter(Boolean).join(' ')})`
    }

    if (name === 'rates') {
      json.label = `${json.value} (${json.label})`
    }

    return {
      id: item.id,
      ...item,
      ...json
    }
  })
  if (where && where.id) return list[0]
  const map = keyBy(list, 'value')
  return { list, map }
}, params)

export const useService = (name, id, params) => useQuery(['dataset', name, id], async () => {
  if (id === 'create') {
    const maxNum = await axios.select('dataset', 'max(cast(JSON_EXTRACT(pole, "$.number") as decimal)) as max', {
      where: {
        tip: 'service',
        '$.pole.is_finished': 0
      }
    })
    const number = parseInt(_get(maxNum, ['data', 'data', 0, 'max'])) || 0
    return {
      pole: {
        number: number + 1,
        date: dayjs(),
        status: 0
      }
    }
  }

  const where = typeof name === 'object' ? name : {
    'JSON_EXTRACT(pole, "$.type")': name
  }
  if (typeof id === 'object' && !params) {
    params = id
  } else {
    where.id = id
  }
  const response = await axios.select('dataset', '*',
    {
      where: {
        'status': 0,
        'tip': 'service',
        ...where
      }
    }
  )
  const data = response.data?.data || []
  let placesId = []
  data.forEach(item => {
    const json = parseJSON(item.pole)
    placesId = placesId.concat(json.places || [])
  })
  const places = await getDatasetsById(placesId)()
  const placeMap = keyBy(places, 'id')
  /* await axios.postWithAuth('/query/select', {
    sql: `SELECT d.id as id, d.id_ref as id_ref, d.ref_tip as ref_tip, d.tip as tip, d.pole as pole, n.pole as place, s.id_trip as sending_id, s.from as sending_number, s.json as sending FROM dataset d
      LEFT JOIN dataset n ON d.id_ref=n.id AND n.tip='place'
      LEFT JOIN trip s ON n.id_ref=s.id_trip
      WHERE d.status=0 AND d.tip='service' AND JSON_EXTRACT(d.pole, '$.type')='${name}'${id ? ` AND d.id=${id}` : ''}`.replaceAll('\n', ' ')
  }) */
  const res = data.map(item => {
    const pole = parseJSON(item.pole)
    pole.date = dayjs(pole.date)
    if (pole.start_date) pole.start_date = dayjs(pole.start_date)
    if (pole.end_date) pole.end_date = dayjs(pole.end_date)
    const placeData = (pole.places || []).map(id => placeMap[id])
    return {
      ...item,
      ...pole,
      placeData,
      place: parseJSON(item.place),
      pole
    }
  })
  return id && typeof id !== 'object' ? res[0] : res
}, params)

export const useTemplates = id => useQuery(['template', id], async () => {
  if (id === 'create') {
    return {}
  } 
  const response = await axios.postWithAuth('/data', { private: true })
  const data = (response.data?.data || {})
  return []
  return id ? data[id] : data
})

export const useScriptFile = (id, params) => useQuery(['private-data', id], async () => {
  const response = await axios.postWithAuth('/data', { private: true })
  const data = response.data?.data
  return (data?.script_templates || {})[id]?.file || ''
}, params)

export const getLastCurrencyRate = async (currency, date) => {
  const response = await axios.select('currency_rate', '*', {
    where: `currency='${currency}' AND date<='${date}'`,
    orderBy: 'date DESC'
  })
  return response.data?.data[0]?.rate
}

export const useCurrencyRates = currency => useQuery(['currency-rate', currency], async () => {
  const response = await axios.select('currency_rate', '*', {
    where: `currency='${currency}'`,
    orderBy: 'date DESC'
  })
  return response.data?.data
})

export const useClientInvoices = (id, initialValues = {}) => useQuery(['client-invoices', id], async () => {
  const rate = await getLastCurrencyRate('USD', dayjs().format('YYYY-MM-DD'))
  if (id === 'create') {
    const response = await axios.select(
      'dataset',
      'max(cast(json_extract(pole, "$.number") as decimal)) as max',
      {
        where: {
          status: 0,
          tip: 'cl-invoice',
          'YEAR(json_extract(pole, "$.date"))': `YEAR('${dayjs().format('YYYY-MM-DD')}')`
        }
      }
    )
    const data = response.data?.data || []
    const number = parseInt(_get(data, [0, 'max'])) || 0

    // if (initialValues.sending) {
    //   const response = await axios.select('trip', '*', { where: { id_trip: initialValues.sending } })
    //   const item = (response.data?.data || [])[0]
    // }

    return {
      number: number + 1,
      date: dayjs(),
      rate,
      ...initialValues
    }
  }
  const response = await axios.select('dataset', '*', {
      where: {
        status: 0,
        tip: 'cl-invoice',
        id
      }
    }
  )
  const data = (response.data?.data || []).map(item => ({
    ...item,
    ...parseJSON(item.pole)
  }))
  return id ? {
    rate,
    ...data[0]
  } : data
})
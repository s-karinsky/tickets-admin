import dayjs from 'dayjs'
import { get as _get, keyBy } from 'lodash'
import { useQuery } from 'react-query'
import Cookies from 'universal-cookie'
import axios from './axios'
import { parseJSON, toFormData } from './utils'
import { sqlUpdate, sqlInsert } from './sql'

const sendingSummaryFields = ['id_trip', 'sum(JSON_EXTRACT(m.pole,"$.gross_weight")) AS gross_weight', 'sum(JSON_EXTRACT(n.pole,"$.net_weight")) AS net_weight', 'sum(JSON_EXTRACT(n.pole,"$.count")) AS count']

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
          to: `${Number(isAir)}`
        },
        leftJoin: {
          'dataset m': 'm.id_ref=t.id_trip',
          'dataset n': 'n.id_ref=m.id'
        },
        groupBy: 'id_trip'
      }
    )
  ])
  
  const productsMap = (responseProducts.data?.data || []).reduce((acc, item) => ({
    ...acc,
    [item.id_trip]: item
  }), {})

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
      departure: item.start_datetime,
      delivery: item.complete_datetime,
      json
    }
  })
}

export const getSendingById = sendingId => async () => {
  if (sendingId === 'create') {
    const response = await axios.select('trip', 'max(cast(`from` as decimal)) as max', { where: { canceled: 0, 'YEAR(create_datetime)': `YEAR('${dayjs().format('YYYY-MM-DD')}')` } })
    const data = response.data?.data || []
    const number = parseInt(_get(data, [0, 'max'])) || 0
    return {
      from: number + 1,
      create_datetime: dayjs(),
      json: {
        status: 0
      }
    }
  } else {
    const [ response, responseProducts ] = await Promise.all([
      axios.select('trip', '*', { where: { id_trip: sendingId} }),
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
          },
          groupBy: 'id_trip'
        }
      )
    ])
    const products = (responseProducts.data?.data || [])[0] || {}
    const item = (response.data?.data || [])[0] || {}
    item.json = parseJSON((item.json || '').replaceAll("\n", ''))
    item.create_datetime = dayjs(item.create_datetime)
    item.start_datetime = item.json?.status > 0 && dayjs(item.json?.status_date_1)
    item.complete_datetime = item.json?.status > 1 && dayjs(item.json?.status_date_2)
    item.gross_weight = products.gross_weight
    item.net_weight = products.net_weight
    item.count = products.count
    return item
  }
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
        'dataset s': 's.id_ref=p.id AND s.tip="service" AND JSON_EXTRACT(s.pole, "$.is_finished")=0'
      },
      where: {
        'p.ref_tip': 'sending',
        'p.id_ref': sendingId,
        'p.status': 0
      }
    }),
    axios.select('dataset t', ['t.id', 'sum(JSON_EXTRACT(n.pole,"$.gross_weight")) AS gross_weight', 'sum(JSON_EXTRACT(n.pole,"$.count")) AS count'], {
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
  
  const productsMap = (responseProducts.data?.data || []).reduce((acc, item) => ({
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
    sql = `SELECT p.*, s.pole as service FROM dataset p LEFT JOIN dataset s ON s.id_ref=p.id AND s.tip='service' AND JSON_EXTRACT(s.pole, '$.is_finished')=0 WHERE p.id=${placeId}`
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

export const getDatasetsById = (ids) => async () => {
  if (!ids || !Array.isArray(ids)) return []
  const where = ids.map(id => `d.id=${id}`).join(' OR ')
  const response = await axios.postWithAuth('/query/select', { sql: `SELECT d.*, t.json as sending, t.from as sending_number FROM dataset d LEFT JOIN trip t ON t.id_trip=d.id_ref WHERE ${where}` })
  const data = response.data?.data || []
  return data.map(item => ({
    ...item,
    ...parseJSON(item.pole),
    sending: parseJSON(item.sending)
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

export const useUsers = userId => useQuery(['users'].concat(userId || []), async () => {
  if (userId === 'create') {
    return {
      id_role: '1'
    }
  }

  const response = await axios.postWithAuth('/query/select', {
    sql: `SELECT * FROM users WHERE active=1 AND deleted!=1${userId ? ` AND id_user=${userId}` : ''}`
  })
  const users = (response.data?.data || []).map(user => {
    if (!user.json) {
      user.json = {}
    } else {
      try {
        user.json = JSON.parse(user.json)
      } catch (e) {
        console.warn(e)
      }
    }
    return user
  })
  return userId ? users[0] : users
})

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

export const useCities = (country) => useQuery(['cities', country], async () => {
  const response = await axios.postWithAuth('/query/select', { sql: `SELECT id_city as value, country, name_ru as label FROM city WHERE country='${country}' ORDER BY name_ru` })
  const list = _get(response, ['data', 'data']) || []
  const map = keyBy(list, 'value')
  return { map, list }
}, {
  enabled: !!country
})

export const useDictionary = name => useQuery(['dictionary', name], async () => {
  const response = await axios.postWithAuth('/query/select', { sql: `SELECT * FROM sprset WHERE tip='${name}'` })
  const list = (_get(response, ['data', 'data']) || []).map(item => {
    let json = {}
    try {
      json = JSON.parse(item.pole)
    } catch (e) {
      json = {}
    }
    return json
  })
  const map = keyBy(list, 'value')
  return { list, map }
}, {
  staleTime: 10 * 60 * 1000
})

export const useService = (name, id, params) => useQuery(['dataset', name, id], async () => {
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
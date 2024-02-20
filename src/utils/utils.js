import { map, uniq, orderBy, get, omit } from 'lodash'
import dayjs from 'dayjs'
import axios from './axios'

export const capitalizeFirstLetter = str => {
  return str[0].toUpperCase() + str.substr(1)
}

export const getFileExt = (fileName, withDot = false) => {
  if (!fileName || typeof fileName !== 'string') return ''
  const parts = fileName.split('.')
  const ext = parts[parts.length - 1]
  return withDot ? `.${ext}` : ext
}

export const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
})

export const getOptions = (arr, path) =>
  orderBy(uniq(map(arr, path))).filter(item => item)

export const declOfNum = (number, titles) => {  
  const cases = [2, 0, 1, 1, 1, 2]
  return titles[ (number%100>4 && number%100<20)? 2 : cases[(number%10<5)?number%10:5] ]
}

export const filterTableRows = search => item => {
  if (!search) return true
  const str = Object.values(item).map(
    val => typeof(val) ==='string' && val.length >= 10 && dayjs(val).isValid() ? dayjs(val).format('DD.MM.YYYY') : val
  ).join(';').toLowerCase()
  return str.includes(search.toLowerCase())
}

export const numberFormatter = digits => (val, { userTyping, input }) => userTyping ? input : `${Number(val).toFixed(digits)}`.replace('.', ',')

export const getPaginationSettings = (name) => {
  const defaultSize = localStorage.getItem(`per-page-${name}`) || 20
  return {
    defaultPageSize: defaultSize,
    showSizeChanger: true,
    pageSizeOptions: ['20', '50', '100'],
    size: 'default',
    onShowSizeChange: (current, size) => localStorage.setItem(`per-page-${name}`, size)
  }
}

export const filterOption = (input, { label, value } = {}) => (label ?? '').toLowerCase().includes(input.toLowerCase())

export const toFormData = (params) => {
  const data = new FormData()
  Object.keys(params).forEach(key => {
    data.append(key, params[key])
  })
  return data
}

export const parseJSON = (str, isWarning) => {
  let json
  try {
    json = JSON.parse(str)
  } catch (e) {
    if (isWarning) console.warn(e)
  }
  return json
}

export const localeCompare = (str1, str2) => (str1 || '').localeCompare(str2 || '')

export const localeNumber = number => {
  if (!Number(number) && Number(number) !== 0) return ''
  return Number(number).toLocaleString()
}

export const getSurnameWithInitials = (surname, name = '', middle = '') => {
  if (!surname) return ''
  if (surname && !name) return surname
  let result = `${surname} ${name[0]}.`
  if (middle) result += ` ${middle[0]}.`
  return result
}

export const getKeyFromName = name => [].concat(name).join('-')

export const getMaxNumber = async (tableName, fieldName, where) => {
  if (fieldName[0] === '$') {
    const parts = fieldName.split('.')
    fieldName = `JSON_EXTRACT(${parts[1]}, "$.${parts.slice(2).join('.')}")`
  }
  const maxNum = await axios.select(tableName, `max(cast(\`${fieldName}\` as decimal)) as max`, { where })
  return parseInt(get(maxNum, ['data', 'data', 0, 'max'])) || 0
}

export const copySending = async (id) => {
  let response
  response = await axios.select('trip', ['`id_trip`', '`from`', '`json`'], { where: { id_trip: id } })
  const sending = (response.data?.data || [])[0]
  if (!sending) return
  sending.json = parseJSON(sending.json)

  response = await axios.select('dataset', '*', { where: `id_ref=${id} AND tip="place"` })
  const places = (response.data?.data || []).map(place => {
    place.pole = parseJSON(place.pole)
    return place
  })
  const placesId = places.map(item => item.id)
  response = await axios.select('dataset', '*', { where: `(${placesId.map(id => `id_ref=${id}`).join(' OR ')}) AND tip="product"` })
  let products = (response.data?.data || []).map(product => {
    product.pole = parseJSON(product.pole)
    return product
  })

  const sendingNumber = await getMaxNumber('trip', 'from', { canceled: 0, 'YEAR(create_datetime)': `YEAR('${dayjs().format('YYYY-MM-DD')}')` }) + 1
  sending.create_datetime = dayjs().format('YYYY-MM-DD')
  sending.from = sendingNumber
  sending.canceled = 0
  sending.to = 0
  sending.json.status = 0
  sending.json.status_date_0 = undefined
  sending.json.status_date_1 = undefined

  const insertSending = omit(sending, ['id_trip'])
  response = await axios.insert('trip', insertSending)
  const sendingId = response.data?.data?.id
  const [ placesOrder, insertPlaces ] = places.reduce((acc, place) => {
    acc[0].push(place.id)
    place.id_ref = sendingId
    acc[1].push(omit(place, ['id']))
    return acc
  }, [[], []])
  response = await axios.insert('dataset', insertPlaces)
  const insertPlacesId = response.data?.data?.id
  const placesIdMap = placesOrder.reduce((acc, id, i) => ({ ...acc, [id]: insertPlacesId + i }), {})
  products = products.map(product => {
    product.id_ref = placesIdMap[product.id_ref]
    return omit(product, ['id'])
  })
  response = await axios.insert('dataset', products)
  return sendingId
}
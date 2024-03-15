import { useQuery } from 'react-query'
import dayjs from 'dayjs'
import { getMaxNumber, parseJSON } from './utils'
import axios from './axios'
import { getLastCurrencyRate } from './api'
import { NEW_ID } from '../consts'

export const useProductsCategory = (id, params) => useQuery(['products-category', id], async () => {
  const tip = 'prod-cat'
  if (id === NEW_ID) {
    return {}
  }
  let where = {}
  if (typeof id === 'object') {
    where = id
  } else {
    where.id = id
  }
  const response = await axios.select('sprset', '*', { where: { tip, status: 0, ...where } })
  const list = response.data?.data || []
  const result = list.map(item => {
    const pole = parseJSON(item.pole)
    return {
      ...item,
      ...pole,
      pole
    }
  })
  return typeof id === 'string' ? result[0] : result
}, params)

export const useCompanyIncome = (id) => useQuery(['company-income', id], async () => {
  const tip = 'com-income'
  if (id === NEW_ID) {
    const rate = await getLastCurrencyRate('USD', dayjs().format('YYYY-MM-DD'))
    const number = await getMaxNumber('dataset', '$.pole.number', { tip, status: 0 })
    return {
      number: number + 1,
      rate
    }
  }
  const response = await axios.select('dataset', '*', { where: { tip, id, status: 0 } })
  const list = response.data?.data
  if (!Array.isArray(list)) {
    return null
  }
  const result = list.map(item => {
    const pole = parseJSON(item.pole)
    pole.date = dayjs(pole.date)
    pole.income_date = dayjs(pole.income_date)
    if (pole.done_date) {
      pole.done_date = dayjs(pole.done_date)
    }
    return {
      ...item,
      ...pole,
      pole
    }
  })

  return id ? result[0] : result
})

export const useCompanyCost = (id) => useQuery(['company-cost', id], async () => {
  const tip = 'com-cost'
  if (id === NEW_ID) {
    const rate = await getLastCurrencyRate('USD', dayjs().format('YYYY-MM-DD'))
    const number = await getMaxNumber('dataset', '$.pole.number', { tip, status: 0 })
    return {
      number: number + 1,
      rate
    }
  }
  const response = await axios.select('dataset', '*', { where: { tip, id, status: 0 } })
  const list = response.data?.data
  if (!Array.isArray(list)) {
    return null
  }
  const result = list.map(item => {
    const pole = parseJSON(item.pole)
    pole.date = dayjs(pole.date)
    pole.cost_date = dayjs(pole.cost_date)
    if (pole.done_date) {
      pole.done_date = dayjs(pole.done_date)
    }
    return {
      ...item,
      ...pole,
      pole
    }
  })

  return id ? result[0] : result
})

export const useCompanyBalance = () => useQuery(['company-balance'], async () => {
  const response = await axios.select('dataset', '*', {
    where: '(tip="com-income" OR tip="com-cost" OR tip="cl-payment" OR tip="dr-payment") AND status=0 AND JSON_EXTRACT(pole, "$.done")=true'
  })
  const list = (response.data?.data || [])
  return list.map(item => {
    const pole = parseJSON(item.pole)
    pole.date = dayjs(pole.date)
    pole.done_date = dayjs(pole.done_date)
    return {
      ...item,
      ...pole,
      pole
    }
  })
})

export const useRoles = (id, params = {}) => useQuery(['roles', id], async () => {
  const response = await axios.select('users_roles', '*', { where: { id_role: id, active: 1 } })
  const list = (response.data?.data || []).map(item => ({
    ...item,
    json: parseJSON(item.json) || {}
  }))
  return id ? list[0] : list
}, params)
import { useQuery } from 'react-query'
import dayjs from 'dayjs'
import { getMaxNumber, parseJSON } from './utils'
import axios from './axios'
import { getLastCurrencyRate } from './api'
import { NEW_ID } from '../consts'

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
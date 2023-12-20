import { map, uniq, orderBy } from 'lodash'
import dayjs from 'dayjs'

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
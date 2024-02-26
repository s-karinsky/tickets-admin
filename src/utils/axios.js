import axios from 'axios'
import Cookies from 'universal-cookie'
import { toFormData } from './utils'
import { sqlInsert, sqlSelect, sqlUpdate } from './sql'
import { API_URL } from '../consts'

const instance = axios.create({
  baseURL: API_URL
})

instance.postWithAuth = function(url, params, options) {
  const cookies = new Cookies()
  const data = params || {}
  let formData = data
  if (data instanceof URLSearchParams) {
    formData.append('token', cookies.get('token'))
    formData.append('u_hash', cookies.get('u_hash'))
  } else {
    data.token = cookies.get('token')
    data.u_hash = cookies.get('u_hash')
    formData = toFormData(data)
  }
  return instance.post(url, formData, options)
}

instance.select = (...args) => {
  return instance.postWithAuth('/query/select', { sql: sqlSelect(...args) } )
}

instance.insert = (...args) => {
  return instance.postWithAuth('/query/insert', { sql: sqlInsert(...args) })
}

instance.update = (...args) => {
  return instance.postWithAuth('/query/update', { sql: sqlUpdate(...args) })
}

export default instance
import axios from 'axios'
import Cookies from 'universal-cookie'
import toFormData from './formData'
import { API_URL } from '../consts'

const instance = axios.create({
  baseURL: API_URL
})

instance.postWithAuth = function(url, params) {
  const cookies = new Cookies()
  const data = params || {}
  data.token = cookies.get('token')
  data.u_hash = cookies.get('u_hash')
  const formData = toFormData(data)
  return instance.post(url, formData)
}

export default instance
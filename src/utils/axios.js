import axios from 'axios'
import { API_URL } from '../consts'

export default axios.create({
  baseURL: API_URL
})
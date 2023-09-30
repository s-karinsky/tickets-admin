import axios from '../../utils/axios'
import { setLoading, setLoaded, setConfig } from '.'

export const fetchConfig = async (dispatch) => {
  dispatch(setLoading(true))
  try {
    const resp = await axios.get('/data')
    const { data } = resp.data
    const {currencies} = data.data
    const currency = {
      default: data.default_currency,
      map: Object.keys(currencies).reduce((acc, code) => ({ ...acc, [code]: { ...currencies[code], code } }), {})
    }
    dispatch(setConfig({ currency }))
    dispatch(setLoaded(true))
  } catch(e) {
    console.error(e)
  } finally {
    dispatch(setLoading(false))
  }
}

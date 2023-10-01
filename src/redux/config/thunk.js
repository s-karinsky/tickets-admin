import axios from '../../utils/axios'
import { setLoading, setLoaded, setConfig, setUpdating } from '.'

export const fetchConfig = async (dispatch) => {
  dispatch(setLoading(true))
  try {
    const resp = await axios.get('/data')
    const { data } = resp.data
    const { currencies, lang_vls, langs: respLangs } = data.data
    const currency = {
      default: data.default_currency,
      map: Object.keys(currencies).reduce((acc, code) => ({ ...acc, [code]: { ...currencies[code], code } }), {})
    }
    const langs = Object.keys(respLangs).reduce((acc, id) => ({ ...acc, [id]: { ...respLangs[id], id } }), {})
    dispatch(setConfig({ currency, langs, langValues: lang_vls }))
    dispatch(setLoaded(true))
  } catch(e) {
    console.error(e)
  } finally {
    dispatch(setLoading(false))
  }
}

export const updateLang = lang_vls => async (disaptch) => {
  disaptch(setUpdating(true))
  try {
    await axios.postWithAuth('/data', {
      data: JSON.stringify({ lang_vls })
    })
  } catch (e) {
    console.error(e)
  } finally {
    disaptch(setUpdating(false))
  }
}
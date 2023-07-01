import axios from '../../utils/axios'
import { setLoading, setData } from '.'

export const fetchData = (params) => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    const res = await axios.get('/data', { params: { fields: 'F', easy: true }})
    const data = res.data?.data?.data
    dispatch(setData(data))
  } catch(e) {
    console.error(e)
  } finally {
    dispatch(setLoading(false))
  }
}

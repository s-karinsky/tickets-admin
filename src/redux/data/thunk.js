import axios from '../../utils/axios'
import { setLoading, setLoaded, setSubmitting, updateData, setData } from '.'

export const fetchData = params => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    const res = await axios.get('/data', { params: { fields: 'F', easy: true }})
    const data = res.data?.data?.data
    dispatch(setData(data))
  } catch(e) {
    console.error(e)
  } finally {
    dispatch(setLoaded(true))
    dispatch(setLoading(false))
  }
}

export const postData = params => async (dispatch) => {
  dispatch(setSubmitting(true))
  try {
    await axios.postWithAuth('/data', {
      data: JSON.stringify(params)
    })
    dispatch(updateData(params))
  } catch(e) {
    console.error(e)
  } finally {
    dispatch(setSubmitting(false))
  }
}
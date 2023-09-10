import axios from '../../utils/axios'
import { setLoading, setLoaded, setSubmitting, updateData, setData, setStadiumScheme, setStadiumSchemeStatus } from '.'

export const fetchData = (params = { fields: 'F', easy: true }) => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    const res = await axios.get('/data', { params })
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

export const fetchStadiumScheme = stadiumId => async (dispatch) => {
  dispatch(setStadiumSchemeStatus({ id: stadiumId, isLoading: true }))
  try {
    const { data } = await axios.post(`/data?fields=1&key=${stadiumId}`)
    const scheme = data.stadiums[stadiumId].scheme
    dispatch(setStadiumSchemeStatus({ id: stadiumId, isLoading: false, isLoaded: true }))
    dispatch(setStadiumScheme({ id: stadiumId, scheme }))
    console.log(data)
  } catch (e) {
    dispatch(setStadiumSchemeStatus({ id: stadiumId, isLoading: false }))
    console.error(e)
  }
}
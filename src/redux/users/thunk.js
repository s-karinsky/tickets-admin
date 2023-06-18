import axios from '../../utils/axios'
import toFormData from '../../utils/formData'
import { setLoaded, setLoading, setPage, setUserList } from '.'

export const getUserList = (page, perPage) => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    const res = await axios.postWithAuth('/user', {
      lo: (page - 1) * perPage,
      lc: perPage,
    })
    const data = res.data?.data?.user
    if (!data) return
    const userList = Object.values(data)
    dispatch(setUserList(userList))
  } catch(e) {
    console.error(e)
  } finally {
    dispatch(setLoading(false))
  }
}
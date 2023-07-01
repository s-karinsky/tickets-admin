import axios from '../../utils/axios'
import { setLoading, setCurrentProfile, setUserList } from '.'

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

export const getUser = id => async (dispatch) => {
  try {
    const res = await axios.postWithAuth(`/user/${id}`)
    const users = res.data?.data?.user
    if (!users || !users[id]) return
    dispatch(setCurrentProfile(users[id]))
  } catch(e) {
    console.error(e)
  }
}
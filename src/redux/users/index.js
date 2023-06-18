import { createSlice } from '@reduxjs/toolkit'

export const usersSlice = createSlice({
  name: 'users',
  initialState: {
    isLoading: false,
    isLoaded: false,
    perPage: 30,
    page: 1,
    list: []
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setLoaded: (state, action) => {
      state.isLoaded = action.payload
    },
    setPage: (state, action) => {
      state.page = action.payload
    },
    setPerPage: (state, action) => {
      state.perPage = action.payload
    },
    setUserList: (state, action) => {
      state.list = action.payload
    }
  },
})

export const {
  setLoading,
  setLoaded,
  setPage,
  setPerPage,
  setUserList,
} = usersSlice.actions

export * from './thunk'

export default usersSlice.reducer
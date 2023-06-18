import { createSlice } from '@reduxjs/toolkit'

export const usersSlice = createSlice({
  name: 'users',
  initialState: {
    isLoading: false,
    isLoaded: false,
    perPage: 30,
    page: 1,
    list: [],
    currentProfile: null,
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
    },
    setCurrentProfile: (state, action) => {
      state.currentProfile = action.payload
    }
  },
})

export const {
  setLoading,
  setLoaded,
  setPage,
  setPerPage,
  setUserList,
  setCurrentProfile,
} = usersSlice.actions

export * from './thunk'

export default usersSlice.reducer
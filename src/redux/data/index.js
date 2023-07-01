import { createSlice } from '@reduxjs/toolkit'

export const dataSlice = createSlice({
  name: 'data',
  initialState: {
    isLoading: false,
    isLoaded: false,
    tournaments: {},
    teams: {},
    stadiums: {},
    schedule: {},
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setLoaded: (state, action) => {
      state.isLoaded = action.payload
    },
    setData: (state, action) => {
      ['stadiums', 'schedule', 'teams', 'tournaments'].forEach(name => {
        const obj = action.payload[name]
        if (!obj) return
        Object.keys(obj).forEach(id => {
          obj[id].id = id
        })
        state[name] = obj
      })
    },
    updateData: (state, action) => {
      ['stadiums', 'schedule', 'teams', 'tournaments'].forEach(name => {
        const obj = action.payload[name]
        if (!obj) return
        Object.keys(obj).forEach(id => {
          obj[id].id = id
        })
        state[name] = { ...state[name], ...obj }
      })
    }
  },
})

export const {
  setLoading,
  setLoaded,
  setData,
  updateData,
} = dataSlice.actions

export * from './selectors'

export * from './thunk'

export default dataSlice.reducer
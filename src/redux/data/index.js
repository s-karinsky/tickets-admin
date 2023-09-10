import { createSlice } from '@reduxjs/toolkit'

export const dataSlice = createSlice({
  name: 'data',
  initialState: {
    isLoading: false,
    isLoaded: false,
    isSubmitting: false,
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
    setSubmitting: (state, action) => {
      state.isSubmitting = action.payload
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
    },
    setStadiumScheme: (state, action) => {
      const { id, scheme } = action.payload
      if (!state.stadiums || !state.stadiums[id]) return
      state.stadiums[id].scheme = scheme
    },
    setStadiumSchemeStatus: (state, action) => {
      const { payload = {} } = action
      const { id, isLoaded, isLoading } = payload
      if (!state.stadiums || !state.stadiums[id]) return
      if (isLoaded !== undefined) {
        state.stadiums[id].isSchemeLoaded = isLoaded
      }
      if (isLoading !== undefined) {
        state.stadiums[id].isSchemeLoading = isLoading
      }
    }
  },
})

export const {
  setLoading,
  setLoaded,
  setSubmitting,
  setData,
  updateData,
  setStadiumScheme,
  setStadiumSchemeStatus
} = dataSlice.actions

export * from './selectors'

export * from './thunk'

export default dataSlice.reducer
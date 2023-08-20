import { createSlice } from '@reduxjs/toolkit'

export const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: {
    isLoading: false,
    isLoaded: false,
    ticketGroups: []
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setLoaded: (state, action) => {
      state.isLoaded = action.payload
    },
    setTicketGroups: (state, action) => {
      state.ticketGroups = action.payload
    }
  },
})

export const {
  setLoading,
  setLoaded,
  setTicketGroups,
} = ticketsSlice.actions

export * from './selectors'

export * from './thunk'

export default ticketsSlice.reducer
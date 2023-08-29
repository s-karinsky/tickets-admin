import { createSlice } from '@reduxjs/toolkit'

export const ticketsSlice = createSlice({
  name: 'tickets',
  initialState: {
    isLoading: false,
    isLoaded: false,
    ticketsByMatch: {}
  },
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    setLoaded: (state, action) => {
      state.isLoaded = action.payload
    },
    setTicketByMatch: (state, action) => {
      state.ticketsByMatch = action.payload
    }
  },
})

export const {
  setLoading,
  setLoaded,
  setTicketByMatch,
} = ticketsSlice.actions

export * from './selectors'

export * from './thunk'

export default ticketsSlice.reducer
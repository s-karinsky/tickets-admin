import { configureStore } from '@reduxjs/toolkit'
import userReducer from './user'
import usersReducer from './users'

export default configureStore({
  reducer: {
    user: userReducer,
    users: usersReducer,
  },
})
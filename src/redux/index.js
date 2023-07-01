import { configureStore } from '@reduxjs/toolkit'
import dataReducer from './data'
import userReducer from './user'
import usersReducer from './users'

export default configureStore({
  reducer: {
    data: dataReducer,
    user: userReducer,
    users: usersReducer,
  },
})
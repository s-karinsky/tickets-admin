import { useEffect } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import { Row } from 'antd'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import PageLogin from './pages/Login'
import PageUsers from './pages/Users'
import PageUser from './pages/User'
import Layout from './components/Layout'
import { authorizeByTokens } from './redux/user'
import './App.css'


function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthorized = useSelector(state => state.user.authorized)
  const isLoading = useSelector(state => state.user.isLoading)
  const isLoginPage = location.pathname === '/login'

  useEffect(() => {
    dispatch(authorizeByTokens).then(isSuccess => {
      if (!isSuccess) {
        navigate('/login', { replace: true })
      } else if (isLoginPage) {
        navigate('/users', { replace: true })
      }
    })
  }, [])

  if ((isLoading || !isAuthorized) && !isLoginPage) {
    return (
      <Row style={{ height: '100vh' }} justify="center" align="middle">
        <LoadingOutlined style={{ fontSize: '64px' }} />
      </Row>
    )
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route path="/users" element={<PageUsers />} />
          <Route path="/users/:id" element={<PageUser />} />
        </Route>
        <Route path="/login" element={<PageLogin />} />
      </Routes>
    </div>
  )
}

export default App

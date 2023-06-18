import { useEffect } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import { Row } from 'antd'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import LoginPage from './pages/Login'
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
        <Route path="/" Component={Layout}>
          <Route path="/users" element={<LoginPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  )
}

export default App

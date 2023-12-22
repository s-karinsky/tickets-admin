import { useEffect, useState } from 'react'
import { Row } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import PageLogin from './pages/Login'
import PageUsers from './pages/Users'
import PageUser from './pages/User'
import Sendings from './pages/Sendings'
import Sending from './pages/Sending'
import Place from './pages/Place'
import Layout from './components/Layout'
import { authorizeByTokens } from './redux/user'
import { fetchConfig } from './redux/config'
import './App.css'


function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthorized = useSelector(state => state.user.authorized)
  const isLoading = useSelector(state => state.user.isLoading)
  const isConfigLoaded = useSelector(state => state.config.isLoaded)
  const isLoginPage = location.pathname === '/login'
  const [ isSendingAir, setIsSendingAir ] = useState(false)

  useEffect(() => {
    dispatch(fetchConfig)
  }, [])

  useEffect(() => {
    dispatch(authorizeByTokens).then(role => {
      if (!role) {
        navigate('/login', { replace: true })
      } else if (isLoginPage) {
        navigate(role === '4' ? '/users' : '/tickets', { replace: true })
      }
    })
  }, [isLoginPage])

  if (!isConfigLoaded || ((isLoading || !isAuthorized) && !isLoginPage)) {
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
          <Route path="/sendings" element={<Sendings isSendingAir={isSendingAir} setIsSendingAir={setIsSendingAir} />} />
          <Route path="/sendings/:sendingId" element={<Sending isSendingAir={isSendingAir} />} />
          <Route path="/sendings/:sendingId/:placeId" element={<Place />} />
        </Route>
        <Route path="/login" element={<PageLogin />} />
      </Routes>
    </div>
  )
}

export default App

import { useEffect } from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import { Row } from 'antd'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import PageContent from './pages/Content'
import PageLogin from './pages/Login'
import PageMatch from './pages/Match'
import PageMatches from './pages/Matches'
import PageTickets from './pages/Tickets'
import PageTranslations from './pages/Translations'
import PageUsers from './pages/Users'
import PageUser from './pages/User'
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
          <Route path="/translations" element={<PageTranslations />} />
          <Route path="/content/:page" element={<PageContent />} />
          <Route path="/users" element={<PageUsers />} />
          <Route path="/users/:id" element={<PageUser />} />
          <Route path="/matches" element={<PageMatches />} />
          <Route path="/matches/:id" element={<PageMatch />} />
          <Route path="/tickets/:matchId?" element={<PageTickets />} />
        </Route>
        <Route path="/login" element={<PageLogin />} />
      </Routes>
    </div>
  )
}

export default App

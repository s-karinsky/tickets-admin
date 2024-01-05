import { useEffect, useState } from 'react'
import { Row } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import Cookies from 'universal-cookie'
import PageLogin from './pages/Login'
import PageUsers from './pages/Users'
import PageUser from './pages/User'
import Sendings from './pages/Sendings'
import Sending from './pages/Sending'
import ServiceForm from './pages/ServiceForm'
import ServiceList from './pages/ServiceList'
import Dictionary from './pages/Dictionary'
import DictionaryForm from './pages/Dictionary/form'
import UserForm from './pages/Dictionary/userForm'
import Place from './pages/Place'
import Layout from './components/Layout'
import { useAuthorization } from './utils/api'
import './App.css'

const cookies = new Cookies()

function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const [ isSendingAir, setIsSendingAir ] = useState(false)
  const isLoginPage = location.pathname === '/login'

  const token = cookies.get('token')
  const u_hash = cookies.get('u_hash')
  const user = useAuthorization({ token, u_hash })

  useEffect(() => {
    if (user.isLoading) return
    const role = user.data?.u_role
    if (!role) {
      navigate('/login', { replace: true })
    } else if (isLoginPage) {
      navigate(role === '4' ? '/users' : '/tickets', { replace: true })
    }
  }, [user.isLoading, user.data?.u_role, isLoginPage, navigate])

  if ((user.isLoading || !user.data?.authorized) && !isLoginPage) {
    return (
      <Row style={{ height: '100vh' }} justify='center' align='middle'>
        <LoadingOutlined style={{ fontSize: '64px' }} />
      </Row>
    )
  }

  if ((user.isLoading || !user.data?.authorized) && !isLoginPage) {
    return (
      <Row style={{ height: '100vh' }} justify='center' align='middle'>
        <LoadingOutlined style={{ fontSize: '64px' }} />
      </Row>
    )
  }

  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Layout user={user.data} />}>
          <Route path='/users' element={<PageUsers />} />
          <Route path='/users/:id' element={<PageUser />} />
          <Route path='/sendings' element={<Sendings isSendingAir={isSendingAir} setIsSendingAir={setIsSendingAir} />} />
          <Route path='/sendings/:sendingId' element={<Sending isSendingAir={isSendingAir} />} />
          <Route path='/sendings/:sendingId/:placeId' element={<Place user={user.data} />} />
          <Route path='/services'>
            <Route path=':serviceName' element={<ServiceList />} />
            <Route path=':serviceName/:id' element={<ServiceForm />} />
          </Route>
          <Route path='/dictionary'>
            <Route path='clients' element={<PageUsers role='1' />} />
            <Route path='clients/:id' element={<UserForm name='clients' />} />
            <Route path=':name' element={<Dictionary />} />
            <Route path=':name/:id' element={<DictionaryForm />} />
          </Route>
        </Route>
        <Route path='/login' element={<PageLogin />} />
      </Routes>
    </div>
  )
}

export default App

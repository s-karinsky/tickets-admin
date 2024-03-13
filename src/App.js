import { useEffect } from 'react'
import { Row } from 'antd'
import { LoadingOutlined } from '@ant-design/icons'
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom'
import Cookies from 'universal-cookie'
import PageLogin from './pages/Login'
import PageUsers from './pages/Users'
import PageUser from './pages/User'
import PageInclient from './pages/User/inclient'
import Sendings from './pages/Sendings'
import Sending from './pages/Sending'
import ServiceForm from './pages/ServiceForm'
import ServiceList from './pages/ServiceList'
import Dictionary from './pages/Dictionary'
import DictionaryForm from './pages/Dictionary/form'
import UserForm from './pages/Dictionary/userForm'
import ConfigForm from './pages/Dictionary/config'
import CurrencyRate from './pages/Dictionary/currencyRate'
import Templates from './pages/Templates'
import Template from './pages/Template'
import Place from './pages/Place'
import CompanyBalance from './pages/CompanyBalance'
import CompanyCost from './pages/CompanyCost'
import CompanyCostItem from './pages/CompanyCost/form'
import CompanyIncome from './pages/CompanyIncome'
import CompanyIncomeItem from './pages/CompanyIncome/form'
import ClientInvoices from './pages/ClientInvoices'
import ClientInvoicesForm from './pages/ClientInvoices/form'
import ClientPayments from './pages/ClientPayments'
import ClientPaymentsForm from './pages/ClientPayments/form'
import ClientBalance from './pages/ClientBalance'
import DriversInvoices from './pages/DriversInvoices'
import DriversInvoicesForm from './pages/DriversInvoices/form'
import DriversPayments from './pages/DriversPayments'
import DriversPaymentsForm from './pages/DriversPayments/form'
import DriversBalance from './pages/DriversBalance'
import ProductsCategory from './pages/Dictionary/products-category'
import Roles from './pages/Roles'
import RolesForm from './pages/Roles/form'

import Layout from './components/Layout'
import { useAuthorization } from './utils/api'
import './App.css'

const cookies = new Cookies()

function App() {
  const navigate = useNavigate()
  const location = useLocation()
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
      navigate('/', { replace: true })
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
          <Route path='/profile' element={<UserForm name={user.data?.u_role === '1' ? 'employees' : 'clients'} userId={user.data?.u_id} />} />
          <Route path='/users' element={<PageUsers />} />
          <Route path='/users/:id' element={<PageUser />} />
          <Route path='/users/:client/:id' element={<PageInclient />} />
          <Route path='/sendings' element={<Sendings />} />
          <Route path='/sendings/:sendingId' element={<Sending />} />
          <Route path='/sendings/:sendingId/:placeId' element={<Place user={user.data} />} />
          <Route path='/services'>
            <Route path=':serviceName' element={<ServiceList />} />
            <Route path=':serviceName/:id' element={<ServiceForm />} />
          </Route>
          <Route path='/dictionary'>
            <Route path='config' element={<ConfigForm />} />
            <Route path='currency/:id' element={<CurrencyRate />} />
            <Route path='clients' element={<PageUsers role='1' />} />
            <Route path='clients/:id' element={<UserForm name='clients' />} />
            <Route path='employees' element={<PageUsers role='2' />} />
            <Route path='employees/:id' element={<UserForm name='employees' />} />
            <Route path='rates/:id/:categoryId' element={<ProductsCategory />} />
            <Route path=':name' element={<Dictionary />} />
            <Route path=':name/:id' element={<DictionaryForm />} />
          </Route>
          <Route path='/templates' element={<Templates />} />
          <Route path='/templates/:id' element={<Template />} />
          <Route path='/client-invoices' element={<ClientInvoices />} />
          <Route path='/client-invoices/:id' element={<ClientInvoicesForm />} />
          <Route path='/client-payments' element={<ClientPayments />} />
          <Route path='/client-payments/:id' element={<ClientPaymentsForm user={user.data} />} />
          <Route path='/client-balance' element={<ClientBalance />} />
          <Route path='/drivers-invoices' element={<DriversInvoices />} />
          <Route path='/drivers-invoices/:id' element={<DriversInvoicesForm />} />
          <Route path='/drivers-payments' element={<DriversPayments />} />
          <Route path='/drivers-payments/:id' element={<DriversPaymentsForm />} />
          <Route path='/drivers-balance' element={<DriversBalance />} />
          <Route path='/company-income' element={<CompanyIncome />} />
          <Route path='/company-income/:id' element={<CompanyIncomeItem />} />
          <Route path='/company-cost' element={<CompanyCost />} />
          <Route path='/company-cost/:id' element={<CompanyCostItem />} />
          <Route path='/company-balance' element={<CompanyBalance />} />
          <Route path='/roles' element={<Roles />} />
          <Route path='/roles/:id' element={<RolesForm />} />
        </Route>
        <Route path='/login' element={<PageLogin />} />
      </Routes>
    </div>
  )
}

export default App

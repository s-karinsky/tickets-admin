import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import locale from 'antd/locale/ru_RU'
import { QueryClient, QueryClientProvider } from 'react-query'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import App from './App'
import reportWebVitals from './reportWebVitals'
import 'dayjs/locale/ru';
import './index.css'

dayjs.extend(utc)

const queryClient = new QueryClient()
const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ConfigProvider locale={locale}>
          <App />
        </ConfigProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()

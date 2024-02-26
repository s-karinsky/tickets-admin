import { useQuery } from 'react-query'
import dayjs from 'dayjs'
import { getLastCurrencyRate } from '../../utils/api'

export default function CurrencyRate({ currency = 'USD', date = dayjs().format('YYYY-MM-DD') }) {
  const rate = useQuery(['currency-rate', currency, date], () => getLastCurrencyRate(currency, date))
  console.log(rate)

  return (
    <div></div>
  )
}
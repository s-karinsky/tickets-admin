import { useMemo } from 'react'
import { Button, Table, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import Wrapper from '../../components/Wrapper'
import { useCompanyBalance } from '../../utils/hooks'
import { getColumnSearchProps } from '../../utils/components'
import { localeNumber } from '../../utils/utils'
import { NEW_ID } from '../../consts'

export const ROOT_PATH = '/company-balance'

export default function CompanyBalance() {
  const navigate = useNavigate()
  const { data, isLoading, refetch } = useCompanyBalance()

  const columns = useMemo(() => [
    {
      title: 'Номер',
      dataIndex: 'number',
      ...getColumnSearchProps('number')
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      render: date => date?.format('DD.MM.YYYY'),
      ...getColumnSearchProps('date', { type: 'date' })
    },
    {
      title: 'Дата учёта',
      dataIndex: 'done_date',
      render: date => date && date?.format('DD.MM.YYYY'),
      ...getColumnSearchProps('date', { type: 'date' })
    },
    {
      title: 'Сумма расхода ($)',
      dataIndex: 'pay_usd',
      align: 'right',
      render: (pay, item) => ['com-cost', 'dr-payment'].includes(item.tip) ? localeNumber(pay) : '',
      sorter: (a, b) => {
        const aVal = ['com-cost', 'dr-payment'].includes(a.tip) ? a.pay_usd : 0
        const bVal = ['com-cost', 'dr-payment'].includes(b.tip) ? b.pay_usd : 0
        return (Number(aVal) || 0) - (Number(bVal) || 0)
      }
    },
    {
      title: 'Сумма расхода (₽)',
      dataIndex: 'pay_rub',
      align: 'right',
      render: (pay, item) => ['com-cost', 'dr-payment'].includes(item.tip) ? localeNumber(Math.round(pay)) : '',
      sorter: (a, b) => {
        const aVal = ['com-cost', 'dr-payment'].includes(a.tip) ? a.pay_rub : 0
        const bVal = ['com-cost', 'dr-payment'].includes(b.tip) ? b.pay_rub : 0
        return (Number(aVal) || 0) - (Number(bVal) || 0)
      }
    },
    {
      title: 'Сумма прихода ($)',
      dataIndex: 'pay_usd',
      align: 'right',
      render: (pay, item) => ['com-income', 'cl-payment'].includes(item.tip) ? localeNumber(pay) : '',
      sorter: (a, b) => {
        const aVal = ['com-income', 'cl-payment'].includes(a.tip) ? a.pay_usd : 0
        const bVal = ['com-income', 'cl-payment'].includes(b.tip) ? b.pay_usd : 0
        return (Number(aVal) || 0) - (Number(bVal) || 0)
      }
    },
    {
      title: 'Сумма прихода (₽)',
      dataIndex: 'pay_rub',
      align: 'right',
      render: (pay, item) => ['com-income', 'cl-payment'].includes(item.tip) ? localeNumber(Math.round(pay)) : '',
      sorter: (a, b) => {
        const aVal = ['com-income', 'cl-payment'].includes(a.tip) ? a.pay_rub : 0
        const bVal = ['com-income', 'cl-payment'].includes(b.tip) ? b.pay_rub : 0
        return (Number(aVal) || 0) - (Number(bVal) || 0)
      }
    }
  ], [])

  return (
    <Wrapper
      title='Баланс компании'
      breadcrumbs={[ { title: 'Баланс компании' } ]}
    >
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        onRow={record => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`${ROOT_PATH}/${record.id}`)
            }
          },
        })}
        summary={(pageData) => {
          let totalInvoiceUsd = 0
          let totalInvoiceRub = 0
          let totalPaymentUsd = 0
          let totalPaymentRub = 0
          pageData.forEach((item) => {
            if (['com-income', 'cl-payment'].includes(item.tip)) {
              totalPaymentUsd += item.pay_usd || 0
              totalPaymentRub += item.pay_rub || 0
            } else {
              totalInvoiceUsd += item.pay_usd || 0
              totalInvoiceRub += item.pay_rub || 0
            }
          })
  
          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>Итого</Table.Summary.Cell>
                <Table.Summary.Cell index={1} align='right'>
                  {localeNumber(totalInvoiceUsd)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2} align='right'>
                  {localeNumber(Math.round(totalInvoiceRub))}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3} align='right'>
                  {localeNumber(totalPaymentUsd)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4} align='right'>
                  {localeNumber(Math.round(totalPaymentRub))}
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3}>Разница</Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <nobr>Приход - Расход = <b>{localeNumber((totalPaymentUsd - totalInvoiceUsd).toFixed(2))}$</b></nobr>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <nobr>Приход - Расход = <b>{localeNumber(Math.round(totalPaymentRub - totalInvoiceRub).toFixed())}₽</b></nobr>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          )
        }}
      />
    </Wrapper>
  )
}
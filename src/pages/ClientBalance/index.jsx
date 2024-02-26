import { useMemo } from 'react'
import { Row, Col, Table, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { getColumnSearchProps } from '../../utils/components'
import { useClientBalance, useUsersWithRole } from '../../utils/api'
import { localeCompare, localeNumber, getSurnameWithInitials } from '../../utils/utils'

export default function ClientBalance() {
  const { data, isLoading } = useClientBalance()
  const navigate = useNavigate()
  
  const clients = useUsersWithRole(1)
  const [ clientsOptions, clientsMap ] = useMemo(() => {
    if (!Array.isArray(clients.data)) return [[], {}]
    const options = clients.data.map(item => {
      const fullname = getSurnameWithInitials(item.family, item.name, item.middle)
      return {
        value: item.id_user,
        label: `${item.json?.code}${fullname ? ` (${fullname})` : ''}`
      }
    })
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [clients.data])

  const inclient = useUsersWithRole(4)
  const [ inclientOptions, inclientMap ] = useMemo(() => {
    if (!Array.isArray(inclient.data?.list)) return [[], {}]
    const options = inclient.data.list.map((item) => ({
      value: item.id,
      label: [item.family, item.name, item.middle].filter(Boolean).join(' ')
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [inclient.data])

  const columns = [
    {
      title: 'Тип',
      dataIndex: 'tip',
      render: tip => tip === 'cl-invoice' ? 'Счет' : 'Оплата',
      sorter: (a, b) => localeCompare(a.tip, b.tip),
      ...getColumnSearchProps('tip', { options: [{ value: 'cl-invoice', label: 'Счет' }, { value: 'cl-payment', label: 'Оплата' }] })
    },
    {
      title: 'Учет',
      dataIndex: 'done_date',
      render: date => dayjs(date).format('DD.MM.YYYY'),
      align: 'center',
      sorter: (a, b) => dayjs(a.done_date).valueOf() - dayjs(b.done_date).valueOf(),
      ...getColumnSearchProps('done_date', { type: 'date' })
    },
    {
      title: 'Клиент',
      dataIndex: 'client',
      render: id => clientsMap[id],
      sorter: (a, b) => (clientsMap[a.client] || '').localeCompare(clientsMap[b.client] || ''),
      ...getColumnSearchProps('client', { options: clientsOptions })
    },
    {
      title: 'Внутренний клиент',
      dataIndex: 'inclient',
      render: id => inclientMap[id],
      sorter: (a, b) => (inclientMap[a.client] || '').localeCompare(inclientMap[b.client] || ''),
      ...getColumnSearchProps('inclient', { options: inclientOptions })
    },
    {
      title: 'Номер счета',
      dataIndex: 'invoice_number',
      render: (_, item) => item.invoice_number || item.number,
      sorter: (a, b) => (a.invoice_number || a.number) > (b.invoice_number || b.number) ? 1 : -1,
      ...getColumnSearchProps(item => item.invoice_number || item.number)
    },
    {
      title: 'Наименование',
      dataIndex: 'name',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      ...getColumnSearchProps('name')
    },
    {
      title: 'Тип средств',
      dataIndex: 'pay_type',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      ...getColumnSearchProps('pay_type', { options: [ { value: 'Наличный' }, { value: 'Безналичный' } ] })
    },
    {
      title: 'Начислено ($)',
      dataIndex: 'pay_usd',
      align: 'right',
      render: (val, item) => item.tip === 'cl-invoice' ? localeNumber(val) : '',
      sorter: (a, b) => a.tip === 'cl-invoice' ? (a.pay_usd > b.pay_usd ? 1 : -1) : -1,
      ...getColumnSearchProps(item => item.tip === 'cl-invoice' ? item.pay_usd : 0, { type: 'number' })
    },
    {
      title: 'Начислено (₽)',
      dataIndex: 'pay_rub',
      align: 'right',
      render: (val, item) => item.tip === 'cl-invoice' ? localeNumber(val) : '',
      sorter: (a, b) => a.tip === 'cl-invoice' ? (a.pay_rub > b.pay_rub ? 1 : -1) : -1,
      ...getColumnSearchProps(item => item.tip === 'cl-invoice' ? item.pay_rub : 0, { type: 'number' })
    },
    {
      title: 'Оплачено ($)',
      dataIndex: 'pay_usd',
      align: 'right',
      key: 'payment_usd',
      render: (val, item) => item.tip === 'cl-payment' ? localeNumber(val) : '',
      sorter: (a, b) => a.tip === 'cl-payment' ? (a.pay_usd > b.pay_usd ? 1 : -1) : -1,
      ...getColumnSearchProps(item => item.tip === 'cl-invoice' ? item.pay_usd : 0, { type: 'number' })
    },
    {
      title: 'Оплачено (₽)',
      dataIndex: 'pay_rub',
      align: 'right',
      key: 'payment_rub',
      render: (val, item) => item.tip === 'cl-payment' ? localeNumber(val) : '',
      sorter: (a, b) => a.tip === 'cl-payment' ? (a.pay_rub > b.pay_rub ? 1 : -1) : -1,
      ...getColumnSearchProps(item => item.tip === 'cl-invoice' ? item.pay_rub : 0, { type: 'number' })
    },
    {
      title: 'Примечание',
      dataIndex: 'note',
      sorter: (a, b) => (a.note || '').localeCompare(b.note || ''),
      ...getColumnSearchProps('note')
    }
  ]

  return (
    <>
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>Баланс по клиентам</Typography.Title>
        </Col>
      </Row>
      <Table
        size='small'
        columns={columns}
        dataSource={data}
        isLoading={isLoading}
        rowKey={({ id }) => id}
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              const type = record.tip === 'cl-payment' ? 'payments' : 'invoices'
              navigate(`/client-${type}/${record.id}`)
            }
          },
        })}
        summary={(pageData) => {
          let totalInvoiceUsd = 0
          let totalInvoiceRub = 0
          let totalPaymentUsd = 0
          let totalPaymentRub = 0
          pageData.forEach((item) => {
            if (item.tip === 'cl-invoice') {
              totalInvoiceUsd += item.pay_usd || 0
              totalInvoiceRub += item.pay_rub || 0
            } else {
              totalPaymentUsd += item.pay_usd || 0
              totalPaymentRub += item.pay_rub || 0
            }
          })
  
          return (
            <>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={7}>Итого</Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  {localeNumber(totalInvoiceUsd)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  {localeNumber(totalInvoiceRub)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  {localeNumber(totalPaymentUsd)}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  {localeNumber(totalPaymentRub)}
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={7}>Разница</Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <nobr>Оплачено - Начислено = <b>{localeNumber((totalPaymentUsd - totalInvoiceUsd).toFixed(2))}$</b></nobr>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <nobr>Оплачено - Начислено = <b>{localeNumber((totalPaymentRub - totalInvoiceRub).toFixed())}₽</b></nobr>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          )
        }}
      />
    </>
  )
}
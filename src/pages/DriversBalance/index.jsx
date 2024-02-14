import { useEffect, useMemo } from 'react'
import { Row, Col, Button, Table, Typography, Modal } from 'antd'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ExclamationCircleFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import { BsTrash } from 'react-icons/bs'
import axios from '../../utils/axios'
import { getColumnSearchProps } from '../../utils/components'
import { useDriversBalance, useDictionary } from '../../utils/api'
import { localeCompare } from '../../utils/utils'

export default function DriversBalance() {
  const { data, isLoading, refetch } = useDriversBalance()
  const navigate = useNavigate()
  
  const drivers = useDictionary('drivers')
  const [ driversOptions, driversMap ] = useMemo(() => {
    if (!Array.isArray(drivers.data?.list)) return [[], {}]
    const options = drivers.data.list.map(({ pole = {}, ...item }) => ({
      value: item.id,
      label: item.label
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [drivers.data])


  const columns = [
    {
      title: 'Тип',
      dataIndex: 'tip',
      render: tip => tip === 'dr-invoice' ? 'Счет' : 'Оплата',
      sorter: (a, b) => localeCompare(a.tip, b.tip),
      ...getColumnSearchProps('tip', { options: [{ value: 'dr-invoice', label: 'Счет' }, { value: 'dr-payment', label: 'Оплата' }] })
    },
    {
      title: 'Учет',
      dataIndex: 'done_date',
      render: date => dayjs(date).format('DD.MM.YYYY'),
      sorter: (a, b) => dayjs(a.done_date).valueOf() - dayjs(b.done_date).valueOf(),
      ...getColumnSearchProps('done_date', { type: 'date' })
    },
    {
      title: 'Перевозчик',
      dataIndex: 'driver',
      render: id => driversMap[id],
      sorter: (a, b) => (driversMap[a.driver] || '').localeCompare(driversMap[b.driver] || ''),
      ...getColumnSearchProps('driver', { options: driversOptions })
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
      render: (val, item) => item.tip === 'dr-invoice' ? val : '',
      sorter: (a, b) => a.tip === 'dr-invoice' ? (a.pay_usd > b.pay_usd ? 1 : -1) : -1,
      ...getColumnSearchProps(item => item.tip === 'dr-invoice' ? item.pay_usd : 0, { type: 'number' })
    },
    {
      title: 'Начислено (₽)',
      dataIndex: 'pay_rub',
      render: (val, item) => item.tip === 'dr-invoice' ? val : '',
      sorter: (a, b) => a.tip === 'dr-invoice' ? (a.pay_rub > b.pay_rub ? 1 : -1) : -1,
      ...getColumnSearchProps(item => item.tip === 'dr-invoice' ? item.pay_rub : 0, { type: 'number' })
    },
    {
      title: 'Оплачено ($)',
      dataIndex: 'pay_usd',
      key: 'payment_usd',
      render: (val, item) => item.tip === 'dr-payment' ? val : '',
      sorter: (a, b) => a.tip === 'dr-payment' ? (a.pay_usd > b.pay_usd ? 1 : -1) : -1,
      ...getColumnSearchProps(item => item.tip === 'dr-invoice' ? item.pay_usd : 0, { type: 'number' })
    },
    {
      title: 'Оплачено (₽)',
      dataIndex: 'pay_rub',
      key: 'payment_rub',
      render: (val, item) => item.tip === 'dr-payment' ? val : '',
      sorter: (a, b) => a.tip === 'dr-payment' ? (a.pay_rub > b.pay_rub ? 1 : -1) : -1,
      ...getColumnSearchProps(item => item.tip === 'dr-invoice' ? item.pay_rub : 0, { type: 'number' })
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
          <Typography.Title style={{ fontWeight: 'bold' }}>Баланс перевозчиков</Typography.Title>
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
              const type = record.tip === 'dr-payment' ? 'payments' : 'invoices'
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
            if (item.tip === 'dr-invoice') {
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
                <Table.Summary.Cell index={0} colSpan={6}>Итого</Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  {totalInvoiceUsd}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}>
                  {totalInvoiceRub}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={3}>
                  {totalPaymentUsd}
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}>
                  {totalPaymentRub}
                </Table.Summary.Cell>
              </Table.Summary.Row>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={6}>Разница</Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <nobr>Оплачено - Начислено = <b>{(totalPaymentUsd - totalInvoiceUsd).toFixed(2)}$</b></nobr>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1} colSpan={2}>
                  <nobr>Оплачено - Начислено = <b>{(totalPaymentRub - totalInvoiceRub).toFixed()}₽</b></nobr>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </>
          )
        }}
      />
    </>
  )
}
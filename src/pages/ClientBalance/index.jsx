import { useEffect, useMemo } from 'react'
import { Row, Col, Button, Table, Typography, Modal } from 'antd'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ExclamationCircleFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import { BsTrash } from 'react-icons/bs'
import axios from '../../utils/axios'
import { getColumnSearchProps } from '../../utils/components'
import { useClientBalance, useUsersWithRole } from '../../utils/api'
import { localeCompare } from '../../utils/utils'

export default function ClientBalance() {
  const { data, isLoading, refetch } = useClientBalance()
  const navigate = useNavigate()
  
  const clients = useUsersWithRole(1)
  const [ clientsOptions, clientsMap ] = useMemo(() => {
    if (!Array.isArray(clients.data)) return [[], {}]
    const options = clients.data.map(item => ({
      value: item.id_user,
      label: item.json?.code
    }))
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
      title: 'Дата учета',
      dataIndex: 'done_date',
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
      sorter: (a, b) => a.invoice_number > b.invoice_number ? 1 : -1,
      ...getColumnSearchProps('invoice_number')
    },
    {
      title: 'Дата счета',
      dataIndex: 'invoice_date',
      sorter: (a, b) => dayjs(a.invoice_date).valueOf() - dayjs(b.invoice_date).valueOf(),
      ...getColumnSearchProps('invoice_date', { type: 'date' })
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
      title: 'Курс 1$',
      dataIndex: 'rate',
      sorter: (a, b) => a.rate > b.rate ? 1 : -1,
      ...getColumnSearchProps('rate', { type: 'number' })
    },
    {
      title: 'Сумма начислено ($)',
      dataIndex: ['invoice', 'pay_usd'],
      sorter: (a, b) => a.invoice?.pay_usd > b.invoice?.pay_usd ? 1 : -1,
      ...getColumnSearchProps(item => item.invoice?.pay_usd, { type: 'number' })
    },
    {
      title: 'Сумма начислено (₽)',
      dataIndex: ['invoice', 'pay_rub'],
      sorter: (a, b) => a.invoice?.pay_rub > b.invoice?.pay_rub ? 1 : -1,
      ...getColumnSearchProps(item => item.invoice?.pay_rub, { type: 'number' })
    },
    {
      title: 'Сумма оплачено ($)',
      dataIndex: 'pay_usd',
      sorter: (a, b) => a.pay_usd > b.pay_usd ? 1 : -1,
      ...getColumnSearchProps('pay_usd', { type: 'number' })
    },
    {
      title: 'Сумма оплачено (₽)',
      dataIndex: 'pay_rub',
      sorter: (a, b) => a.pay_rub > b.pay_rub ? 1 : -1,
      ...getColumnSearchProps('pay_rub', { type: 'number' })
    },
    {
      title: 'Примечание',
      dataIndex: 'note',
      sorter: (a, b) => (a.note || '').localeCompare(b.note || ''),
      ...getColumnSearchProps('note')
    }
  ]

  console.log(data)

  return (
    <>
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>Счета на оплату клиентам</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            type='primary'
            size='large'
            onClick={() => navigate(`/client-invoices/create`)}
          >
            Создать
          </Button>
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
              navigate(`/client-invoices/${record.id}`)
            }
          },
        })}
      />
    </>
  )
}
import { useMemo } from 'react'
import { Row, Col, Button, Table, Typography, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { BsTrash } from 'react-icons/bs'
import { ExclamationCircleFilled } from '@ant-design/icons'
import axios from '../../utils/axios'
import { getColumnSearchProps } from '../../utils/components'
import { useClientPayments, useUsersWithRole, useDictionary } from '../../utils/api'
import { localeCompare } from '../../utils/utils'

const getColumns = ({ refetch, navigate, clientsMap, inclientMap, employeMap }) => ([
  {
    title: 'Номер',
    dataIndex: 'number',
    sorter: (a, b) => a.number - b.value,
    ...getColumnSearchProps('number')
  },
  {
    title: 'Дата',
    dataIndex: 'created_at',
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    render: date => dayjs(date).format('DD.MM.YYYY'),
    ...getColumnSearchProps('date', { type: 'date' })
  },
  {
    title: 'Клиент',
    dataIndex: 'client',
    sorter: (a, b) => localeCompare(clientsMap[a.client], clientsMap[b.client]),
    render: (client) => clientsMap[client],
    ...getColumnSearchProps(client => clientsMap[client])
  },
  {
    title: 'Внутренний клиент',
    dataIndex: 'inclient',
    sorter: (a, b) => localeCompare(inclientMap[a.inclient], inclientMap[b.inclient]),
    render: (inclient) => inclientMap[inclient],
    ...getColumnSearchProps(inclient => inclientMap[inclient])
  },
  {
    title: 'Счет',
    dataIndex: 'invoice_number',
    sorter: (a, b) => a.invoice_number - b.invoice_number,
    ...getColumnSearchProps('invoice_number')
  },
  {
    title: 'Тип оплаты',
    dataIndex: 'pay_type',
    sorter: (a, b) => localeCompare(a.pay_type, b.pay_type),
    ...getColumnSearchProps('pay_type', { options: [{ value: 'Наличный' }, { value: 'Безналичный' }] })
  },
  {
    title: 'Получил',
    dataIndex: 'get_employe',
    render: id => employeMap[id],
    sorter: (a, b) => localeCompare(employeMap[a.get_employe], employeMap[b.get_employe]),
    ...getColumnSearchProps('get_employe')
  },
  {
    title: 'К оплате ($)',
    dataIndex: 'pay_usd',
    sorter: (a, b) => a.pay_usd - b.pay_usd,
    ...getColumnSearchProps('pay_usd', { type: 'number' })
  },
  {
    title: 'К оплате (₽)',
    dataIndex: 'pay_rub',
    sorter: (a, b) => a.pay_rub - b.pay_rub,
    ...getColumnSearchProps('pay_rub', { type: 'number' })
  },
  {
    title: 'Дата учета',
    dataIndex: 'done_date',
    sorter: (a, b) => new Date(a.done_date).getTime() - new Date(b.done_date).getTime(),
    ...getColumnSearchProps('done_date', { type: 'date' })
  },
  {
    title: 'Наименование',
    dataIndex: 'name',
    sorter: (a, b) => localeCompare(a.name, b.name),
    ...getColumnSearchProps('name')
  },
  {
    title: 'Примечание',
    dataIndex: 'note',
    sorter: (a, b) => localeCompare(a.note, b.note),
    ...getColumnSearchProps('note')
  },
  {
    title: '',
    key: 'buttons',
    render: (_, item) => {
      return (
        <>
          <Button
            type='primary'
            size='small'
            style={{ marginTop: 5 }}
            onClick={() => navigate('/client-invoices/create', { state: { type: 'payment', id: item.id } })}
          >
            Создать счет
          </Button>
          <BsTrash
            style={{ marginLeft: 30, cursor: 'pointer' }}
            size={17}
            color='red'
            onClick={() => {
              Modal.confirm({
                title: 'Вы действительно хотите удалить этот счет?',
                icon: <ExclamationCircleFilled />,
                okText: 'Да',
                okType: 'danger',
                cancelText: 'Нет',
                onOk: async () => {
                  await axios.postWithAuth('/query/update', { sql: `update dataset set status=1 where id=${item.id}` })
                  refetch()
                }
              })
            }}
          />
        </>
      )
    }
  }
])

export default function ClientPayments() {
  const { data, isLoading, refetch } = useClientPayments()
  const navigate = useNavigate()
  const clients = useUsersWithRole(1)
  const [ clientsOptions, clientsMap ] = useMemo(() => {
    if (!Array.isArray(clients.data)) return [[], {}]
    const options = clients.data.map(({ json = {}, ...item }) => ({
      value: item.id_user,
      label: `${json.code} (${[item.family, item.name, item.middle].filter(Boolean).join(' ')})`
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [clients.data])

  const inclient = useDictionary('inclient')
  const [ inclientOptions, inclientMap ] = useMemo(() => {
    if (!Array.isArray(inclient.data?.list)) return [[], {}]
    const options = inclient.data.list.map((item) => ({
      value: item.id,
      label: [item.family, item.name, item.middle].filter(Boolean).join(' ')
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [inclient.data])

  const employe = useUsersWithRole(2)
  const employeMap = useMemo(() => {
    if (!employe.data) return []
    return employe.data.reduce((acc, item) => ({
      ...acc,
      [item.id_user]: item.json?.code
    }))
  }, [employe.data])

  return (
    <>
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>Оплаты клиентов</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            type='primary'
            size='large'
            onClick={() => navigate(`/client-payments/create`)}
          >
            Создать
          </Button>
        </Col>
      </Row>
      <Table
        size='small'
        columns={getColumns({ refetch, navigate, clientsMap, inclientMap, employeMap })}
        dataSource={data}
        isLoading={isLoading}
        rowKey={({ id }) => id}
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/client-payments/${record.id}`)
            }
          },
        })}
      />
    </>
  )
}
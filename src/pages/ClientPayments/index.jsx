import { Row, Col, Button, Table, Typography, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import { BsTrash } from 'react-icons/bs'
import { ExclamationCircleFilled } from '@ant-design/icons'
import axios from '../../utils/axios'
import { getColumnSearchProps } from '../../utils/components'
import { useClientPayments } from '../../utils/api'
import { localeCompare } from '../../utils/utils'
import dayjs from 'dayjs'

const getColumns = (refetch, navigate) => ([
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
    sorter: (a, b) => localeCompare(a.client, b.client),
    ...getColumnSearchProps('client')
  },
  {
    title: 'Номер счета',
    dataIndex: 'invoice_number',
    sorter: (a, b) => a.invoice_number - b.invoice_number,
    ...getColumnSearchProps('invoice_number')
  },
  {
    title: 'Наименование',
    dataIndex: 'name',
    sorter: (a, b) => localeCompare(a.name, b.name),
    ...getColumnSearchProps('name')
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
            Создать счет на оплату
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
        columns={getColumns(refetch, navigate)}
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
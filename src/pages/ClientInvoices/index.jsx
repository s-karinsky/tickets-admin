import { Row, Col, Button, Table, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import { getColumnSearchProps } from '../../utils/components'
import { useClientInvoices } from '../../utils/api'
import { localeCompare } from '../../utils/utils'

const columns = [
  {
    title: 'Номер',
    dataIndex: 'number',
    sorter: (a, b) => a.number - b.value,
    ...getColumnSearchProps('number')
  },
  {
    title: 'Дата',
    dataIndex: 'date',
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    ...getColumnSearchProps('date', { type: 'date' })
  },
  {
    title: 'Клиент',
    dataIndex: 'client',
    sorter: (a, b) => localeCompare(a.client, b.client),
    ...getColumnSearchProps('client')
  },
  {
    title: 'Наименование',
    dataIndex: 'name',
    sorter: (a, b) => localeCompare(a.name, b.name),
    ...getColumnSearchProps('name')
  }
]

export default function ClientInvoices() {
  const { data, isLoading } = useClientInvoices()
  const navigate = useNavigate()

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
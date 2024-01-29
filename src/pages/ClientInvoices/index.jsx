import { Row, Col, Button, Table, Typography, Modal } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { BsTrash } from 'react-icons/bs'
import axios from '../../utils/axios'
import { getColumnSearchProps } from '../../utils/components'
import { useClientInvoices } from '../../utils/api'
import { localeCompare } from '../../utils/utils'
import { useEffect } from 'react'

const getColumns = refetch => [
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
    render: (date) => date?.format('DD.MM.YYYY'),
    ...getColumnSearchProps('date', { type: 'date' })
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
      )
    }
  }
]

export default function ClientInvoices() {
  const { data, isLoading, refetch } = useClientInvoices()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.refetch) {
      refetch()
    }
  }, [location.state?.refetch])

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
        columns={getColumns(refetch)}
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
import { Row, Col, Button, Typography, Table } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { useService } from '../../utils/api'

const SERVICES = {
  delivery: {
    title: 'Выдача со склада',
    columns: [
      {
        title: 'Номер',
        key: 'number'
      },
      {
        title: 'Клиент',
        key: 'client'
      }
    ]
  }
}

export default function ServiceList() {
  const { serviceName } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useService(serviceName)

  const columns = [
    {
      title: 'Номер',
      dataIndex: 'number'
    }
  ]

  return (
    <>
      <Row align='bottom' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>{SERVICES[serviceName]?.title}</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right', paddingBottom: 20 }}>
          {/* <Button
            type='primary'
            size='large'
            onClick={() => navigate(`/services/${serviceName}/create`)}
          >
            Создать услугу
          </Button> */}
        </Col>
      </Row>
      <Table
        columns={columns}
        isLoading={isLoading}
        dataSource={data}
        rowKey={({ id }) => id}
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/services/delivery/${record.id}`)
            }
          },
        })}
      />
    </>
  )
}
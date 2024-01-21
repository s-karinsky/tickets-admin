import { Row, Col, Typography, Table, Button, Modal } from 'antd'
import { ExclamationCircleFilled, CheckOutlined } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { BsTrash } from 'react-icons/bs'
import { localeCompare } from '../../utils/utils'
import axios from '../../utils/axios'
import { useTemplates } from '../../utils/api'
import { getColumnSearchProps } from '../../utils/components'

export default function Templates() {
  const { name } = useParams()
  const { data = [], isLoading, refetch } = useTemplates(name)
  const navigate = useNavigate()

  const columns = [
    {
      title: 'id',
      dataIndex: 'id_script_template',
      sorter: (a, b) => a.id_script_template - b.id_script_template,
      ...getColumnSearchProps('id_script_template')
    },
    {
      title: 'Название',
      dataIndex: 'name_ru',
      sorter: (a, b) => localeCompare(a.name_ru, b.name_ru),
      ...getColumnSearchProps('name_ru')
    },
    {
      title: 'value',
      dataIndex: 'value',
      sorter: (a, b) => localeCompare(a.value, b.value),
      ...getColumnSearchProps('value')
    },
    {
      title: 'var',
      dataIndex: 'var',
      sorter: (a, b) => localeCompare(a.var, b.var),
      ...getColumnSearchProps('var')
    },
    {
      title: 'Активный',
      dataIndex: 'active',
      sorter: (a, b) => Number(a.active) - Number(b.active),
      render: mark => mark === '1' ? <CheckOutlined /> : ''
    },
    {
      title: '',
      width: 30,
      key: 'buttons',
      render: (_, item) => (
        <div>
          <BsTrash
            style={{ marginLeft: 30, cursor: 'pointer' }} 
            size={17}
            color='red'
            title='Удалить запись'
            onClick={() => {
              Modal.confirm({
                title: 'Вы действительно хотите удалить эту запись?',
                icon: <ExclamationCircleFilled />,
                okText: 'Да',
                okType: 'danger',
                cancelText: 'Нет',
                onOk: async () => {
                  await axios.postWithAuth('/query/delete', { sql: `DELETE FROM script_template WHERE id_script_template=${item.id_script_template}` })
                  refetch()
                }
              })
            }}
          />
        </div>
      )
    }
  ]

  return (
    <>
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>Шаблоны</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            type='primary'
            size='large'
            onClick={() => navigate(`/templates/create`)}
          >
            Создать
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={data}
        isLoading={isLoading}
        rowKey={({ id_script_template }) => id_script_template}
        onRow={(record) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/templates/${record.id_script_template}`)
            }
          },
        })}
      />
    </>
  )
}
import { useNavigate } from 'react-router-dom'
import { Table, Tag, Row, Button } from 'antd'
import { PlusCircleFilled } from '@ant-design/icons'
import { getColumnSearchProps } from '../../utils/components'
import { useUsers } from '../../utils/api'
import { getPaginationSettings } from '../../utils/utils'
import { USER_ROLES, USER_ROLES_COLOR } from '../../consts'

const columns = [
  {
    title: 'Роль',
    dataIndex: 'id_role',
    key: 'id_role',
    render: text => (<Tag color={USER_ROLES_COLOR[text]}>{USER_ROLES[text]}</Tag>),
    filters: Object.keys(USER_ROLES).map(id => ({
      text: USER_ROLES[id],
      value: id
    })),
    onFilter: (value, record) => record.id_role === value
  },
  {
    title: 'Код',
    dataIndex: 'json',
    key: 'code',
    render: json => json.code,
    ...getColumnSearchProps(record => record.json?.code)
  },
  {
    title: 'Наименование',
    dataIndex: 'name',
    key: 'name',
    render: (name, { family }) => [name, family].filter(item => item).join(' ') || 'No name',
    ...getColumnSearchProps(record => ([record.name, record.family].join(' ')))
  },
  {
    title: 'Телефон',
    dataIndex: 'phone',
    render: phone => phone || 'No phone',
    ...getColumnSearchProps('email')
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: email => email || 'No email',
    ...getColumnSearchProps('email')
  }
]

export default function PageUsers() {
  const navigate = useNavigate()
  const users = useUsers()

  return (
    <>
      <Row
        style={{
          borderBottom: '1px solid #ccc',
          padding: '10px 20px',
        }}
      >
        <Button
          icon={<PlusCircleFilled />}
          style={{ marginRight: '10px' }}
          type='primary'
          onClick={() => navigate('/users/create')}
        >
          Создать пользователя
        </Button>
      </Row>
      <Table
        columns={columns}
        dataSource={users.data}
        loading={users.isLoading}
        rowKey={({ id_user }) => id_user}
        onRow={record => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/users/${record.id_user}`)
            }
          }
        })}
        pagination={getPaginationSettings('users')}
      />
    </>
  )
}
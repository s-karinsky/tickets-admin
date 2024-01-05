import { useNavigate } from 'react-router-dom'
import { Table, Tag, Row, Button, Col, Typography } from 'antd'
import { PlusCircleFilled } from '@ant-design/icons'
import { getColumnSearchProps } from '../../utils/components'
import { useUsers } from '../../utils/api'
import { getPaginationSettings, localeCompare } from '../../utils/utils'
import { USER_ROLES, USER_ROLES_COLOR } from '../../consts'

const TITLE = {
  default: 'Список пользователей',
  1: 'Клиенты',
  2: 'Сотрудники'
}

const LINK = {
  default: '/users/',
  1: '/dictionary/clients',
  2: '/dictionary/employees'
}

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
    sorter: (a, b) => localeCompare(a.json?.code, b.json?.code),
    ...getColumnSearchProps(record => record.json?.code)
  },
  {
    title: 'ФИО',
    dataIndex: 'name',
    key: 'name',
    render: (name, { middle, family }) => [family, name, middle].filter(Boolean).join(' ') || 'No name',
    sorter: (a, b) => localeCompare([a.family, a.name, a.middle].filter(Boolean).join(' '), [b.family, b.name, b.middle].filter(Boolean).join(' ')),
    ...getColumnSearchProps(record => ([record.family, record.name, record.middle].filter(Boolean).join(' ')))
  },
  {
    title: 'Телефон',
    dataIndex: 'phone',
    render: phone => phone || 'No phone',
    sorter: (a, b) => localeCompare(a.phone, b.phone),
    ...getColumnSearchProps('email')
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: email => email || 'No email',
    sorter: (a, b) => localeCompare(a.email, b.email),
    ...getColumnSearchProps('email')
  }
]

export default function PageUsers({ role }) {
  const navigate = useNavigate()
  const users = useUsers({ id_role: role })

  return (
    <>
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>{TITLE[role] || TITLE.default}</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            type='primary'
            size='large'
            onClick={() => navigate(`${LINK[role] || LINK.default}create`)}
          >
            Создать
          </Button>
        </Col>
      </Row>
      <Table
        columns={role ? columns.slice(1) : columns}
        dataSource={users.data}
        loading={users.isLoading}
        rowKey={({ id_user }) => id_user}
        onRow={record => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`${LINK[role] || LINK.default}/${record.id_user}`)
            }
          }
        })}
        pagination={getPaginationSettings('users')}
      />
    </>
  )
}
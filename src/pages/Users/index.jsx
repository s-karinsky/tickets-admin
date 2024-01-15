import { useNavigate } from 'react-router-dom'
import { Table, Tag, Row, Button, Col, Typography, Modal } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { BsTrash } from 'react-icons/bs'
import { getColumnSearchProps } from '../../utils/components'
import axios from '../../utils/axios'
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
  1: '/dictionary/clients/',
  2: '/dictionary/employees/'
}

export const getColumns = ({ codeIndex = ['json', 'code'], refetch = () => {}, deleteUser }) => ([
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
    dataIndex: codeIndex,
    key: 'code',
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
  },
  {
    title: '',
    width: 30,
    key: 'buttons',
    render: (_, item) => item.id_role !== '4' && (
      <div>
        <BsTrash
          style={{ marginLeft: 30, cursor: 'pointer' }} 
          size={17}
          color='red'
          title='Удалить запись'
          onClick={() => {
            Modal.confirm({
              title: 'Вы действительно хотите удалить этого пользователя?',
              icon: <ExclamationCircleFilled />,
              okText: 'Да',
              okType: 'danger',
              cancelText: 'Нет',
              onOk: async () => {
                if (deleteUser) {
                  await deleteUser(item)
                } else {
                  await axios.postWithAuth('/query/update', { sql: `UPDATE users SET deleted=1 WHERE id_user=${item.id_user}` })
                }
                refetch()
              }
            })
          }}
        />
      </div>
    )
  }
])

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
        columns={getColumns({ refetch: users.refetch }).slice(role ? 1 : 0)}
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
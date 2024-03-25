import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { keyBy } from 'lodash'
import { Table, Tag, Row, Button, Col, Typography } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import { getColumnSearchProps } from '../../utils/components'
import DeleteButton from '../../components/DeleteButton'
import axios from '../../utils/axios'
import { useUsers, useCountries, useAllCities } from '../../utils/api'
import { useRoles } from '../../utils/hooks'
import { getPaginationSettings, localeCompare } from '../../utils/utils'
import { USER_ROLES, USER_ROLES_COLOR } from '../../consts'

const TITLE = {
  default: 'Список пользователей',
  1: 'Клиенты',
  2: 'Сотрудники'
}

export const getColumns = ({ rolesMap, name, role, countries = {}, cities = {}, noButtons, codeIndex = ['json', 'code'], refetch = () => {}, deleteUser, hasInclient }) => ([
  {
    title: 'Роль',
    dataIndex: 'id_role',
    key: 'id_role',
    render: text => (<Tag color={USER_ROLES_COLOR[text]}>{rolesMap[text]?.name_ru}</Tag>),
    filters: Object.keys(USER_ROLES).filter(key => key !== '3').map(id => ({
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
  role === '1' && {
    title: 'ВК',
    key: 'ic',
    render: item => hasInclient[item.id_user] ? <CheckOutlined /> : ''
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
    render: phone => !phone || phone.startsWith('+') ? (phone || '') : `+${phone}`,
    sorter: (a, b) => localeCompare(a.phone, b.phone),
    ...getColumnSearchProps('email')
  },
  name === 'clients' && {
    title: 'Компания/ИП',
    dataIndex: 'company',
    render: company => company?.name
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: email => email || 'No email',
    sorter: (a, b) => localeCompare(a.email, b.email),
    ...getColumnSearchProps('email')
  },
  ['1', '2'].includes(role) && {
    title: 'Страна',
    dataIndex: ['json', 'country'],
    render: country => countries.map && countries.map[country]?.label
  },
  ['1', '2'].includes(role) && {
    title: 'Город',
    dataIndex: ['json', 'city'],
    render: city => cities.map && cities.map[city]?.label
  },
  role === '1' && {
    title: 'Компания',
    dataIndex: ['json', 'company', 'name']
  },
  ['1', '2'].includes(role) && {
    title: 'Примечание',
    dataIndex: 'note',
    render: note => <div style={{ maxWidth: 80, maxHeight: 55, overflow: 'hidden', textOverflow: 'ellipsis' }} title={note}>{note}</div>
  },
  !noButtons && {
    title: '',
    width: 30,
    key: 'buttons',
    render: (_, item) => item.id_role !== '4' && (
      <DeleteButton
        title='Удалить запись'
        confirm='Вы действительно хотите удалить этого пользователя?'
        onOk={async () => {
          if (deleteUser) {
            await deleteUser(item)
          } else {
            await axios.postWithAuth('/query/update', { sql: `UPDATE users SET deleted=1 WHERE id_user=${item.id_user}` })
          }
          refetch()
        }}
      />
    )
  }
].filter(Boolean))

export default function PageUsers({ role, balance }) {
  const navigate = useNavigate()
  const users = useUsers({ id_role: role })
  const inclients = useUsers(undefined, { id_role: '3' }, { enabled: role === '1' })
  const roles = useRoles()
  const countries = useCountries()
  const cities = useAllCities()
  const rolesMap = useMemo(() => keyBy(roles.data, 'id_role'), [roles.data])

  const hasInclient = useMemo(() => {
    if (!inclients.data) return {}
    return inclients.data.reduce((acc, item) => ({
      ...acc,
      [item.create_user]: true
    }), {})
  }, [inclients.data])

  return (
    <>
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>{balance ? 'Баланс по клиентам' : (TITLE[role] || TITLE.default)}</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            type='primary'
            size='large'
            onClick={() => navigate(`/users/create`, { state: { role } })}
          >
            Создать
          </Button>
        </Col>
      </Row>
      <Table
        size='small'
        columns={getColumns({ rolesMap, role, refetch: users.refetch, countries: countries.data, cities: cities.data, noButtons: balance, hasInclient }).slice(role ? 1 : 0)}
        dataSource={users.data}
        loading={users.isLoading}
        rowKey={({ id_user }) => id_user}
        onRow={record => ({
          onClick: (e) => {
            if (e.detail === 2) {
              if (balance) {
                navigate(`/client-balance/${record.id_user}`)
              } else {
                navigate(`/users/${record.id_user}`)
              }
            }
          }
        })}
        pagination={getPaginationSettings('users')}
      />
    </>
  )
}
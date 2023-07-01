import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table, Tag } from 'antd'
import { fetchUserList, setPage, setPerPage } from '../../redux/users'
import { USER_ROLES, USER_ROLES_COLOR } from '../../consts'

const columns = [
  {
    title: 'Name',
    dataIndex: 'u_name',
    key: 'u_name',
    render: (text, { u_id }) => (<Link to={`/users/${u_id}`}>{text || 'No name'}</Link>)
  },
  {
    title: 'Email',
    dataIndex: 'u_email',
    key: 'u_email',
    render: text => text || 'No email'
  },
  {
    title: 'Role',
    dataIndex: 'u_role',
    key: 'u_role',
    render: text => (<Tag color={USER_ROLES_COLOR[text]}>{USER_ROLES[text]}</Tag>)
  }
]

export default function PageUsers() {
  const dispatch = useDispatch()
  const page = useSelector(state => state.users.page)
  const perPage = useSelector(state => state.users.perPage)
  const isLoading = useSelector(state => state.users.isLoading)
  const users = useSelector(state => state.users.list)

  useEffect(() => {
    dispatch(fetchUserList(page, perPage))
  }, [page, perPage])

  return (
    <Table
      columns={columns}
      dataSource={users}
      loading={isLoading}
      rowKey={({ u_id }) => u_id}
      pagination={{
        current: page,
        pageSize: perPage,
        pageSizeOptions: [10, 20, 30],
        showSizeChanger: true,
        total: 100,
        onChange: (newPage, newPageSize) => {
          if (page !== newPage) {
            dispatch(setPage(newPage))
          }
          if (perPage !== newPageSize) 
          dispatch(setPerPage(newPageSize))
        }
      }}
    />
  )
}
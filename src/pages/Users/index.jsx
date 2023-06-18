import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Table } from 'antd'
import { getUserList, setPage, setPerPage } from '../../redux/users'

const columns = [
  {
    title: 'Name',
    dataIndex: 'u_name',
    key: 'name',
    render: (text, { u_id }) => (<Link to={`/users/${u_id}`}>{text || 'No name'}</Link>)
  },
  {
    title: 'Email',
    dataIndex: 'u_email',
    key: 'email',
    render: text => text || 'No email'
  }
]

export default function PageUsers() {
  const dispatch = useDispatch()
  const page = useSelector(state => state.users.page)
  const perPage = useSelector(state => state.users.perPage)
  const isLoading = useSelector(state => state.users.isLoading)
  const users = useSelector(state => state.users.list)

  useEffect(() => {
    dispatch(getUserList(page, perPage))
  }, [page, perPage])

  return (
    <div>
      <Table
        columns={columns}
        dataSource={users}
        loading={isLoading}
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
    </div>
  )
}
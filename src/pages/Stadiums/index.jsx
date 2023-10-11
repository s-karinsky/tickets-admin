import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, Row, Table } from 'antd'
import { PlusCircleFilled } from '@ant-design/icons'
import { fetchData, getStadiumsList, postData } from '../../redux/data'

const columns = [
  {
    title: 'Name',
    dataIndex: 'en',
    key: 'en'
  },
  {
    title: 'Country',
    dataIndex: 'country',
    key: 'country'
  },
  {
    title: 'Address',
    dataIndex: 'address_en',
    key: 'address_en'
  }
]

export default function PageStadiums() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.user.profile)
  const isLoading = useSelector(state => state.data.isLoading)
  const stadiums = useSelector(getStadiumsList)

  useEffect(() => {
    dispatch(fetchData())
  }, [])

  const handleSwitchTop = useCallback((match) => {
    const { id, top } = match
    dispatch(postData({ schedule: [{ id, top: top ? '1' : '0' }] }))
  }, [])

  return (
    <>
      <Row
        style={{
          borderBottom: '1px solid #ccc',
          padding: '10px'
        }}
      >
        <Button
          icon={<PlusCircleFilled />}
          type='primary'
          onClick={() => navigate('/stadiums/create')}
        >
          Create stadium
        </Button>
      </Row>
      <Table
        columns={columns}
        dataSource={stadiums}
        loading={isLoading}
        rowKey={({ id }) => id}
        onRow={record => ({
            onClick: () => user.u_role === '4' && navigate(`/stadiums/${record.id}`)
        })}
      />
    </>
  )
}
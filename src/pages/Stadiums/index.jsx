import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, Row, Table } from 'antd'
import { PlusCircleFilled } from '@ant-design/icons'
import { getColumnSearchProps } from '../../utils/components'
import { fetchData, getStadiumsList } from '../../redux/data'
import { getCountries } from '../../redux/config'

export default function PageStadiums() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoading = useSelector(state => state.data.isLoading)
  const stadiums = useSelector(getStadiumsList)
  const countries = useSelector(getCountries)

  useEffect(() => {
    dispatch(fetchData())
  }, [])

  
  const columns = [
    {
      title: 'Name',
      dataIndex: 'en',
      key: 'en',
      ...getColumnSearchProps('en'),
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      sorter: (a, b) => a.country.localeCompare(b.country),
      render: id => countries[id]?.en,
      ...getColumnSearchProps('country', record => countries[record.country]?.en),
    },
    {
      title: 'Address',
      dataIndex: 'address_en',
      key: 'address_en',
      ...getColumnSearchProps('address_en'),
    }
  ]

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
            onClick: () => navigate(`/stadiums/${record.id}`)
        })}
      />
    </>
  )
}
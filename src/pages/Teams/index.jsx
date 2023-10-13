import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, Row, Table } from 'antd'
import { PlusCircleFilled } from '@ant-design/icons'
import { fetchData, getTeams } from '../../redux/data'
import { getCities, getCountries } from '../../redux/config'
import { getColumnSearchProps } from '../../utils/components'


export default function PageTeams() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoading = useSelector(state => state.data.isLoading)
  const teams = useSelector(getTeams)
  const cities = useSelector(getCities)
  const countries = useSelector(getCountries)
  
  const columns = [
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      width: 180,
      sorter: (a, b) => a.country.localeCompare(b.country),
      render: id => countries[id].en,
      ...getColumnSearchProps('country', record => countries[record.country].en),
    },
    {
      title: 'Logo',
      dataIndex: 'logo',
      key: 'logo',
      width: 40,
      render: src => (<img src={src} width={32} />)
    },
    {
      title: 'Name',
      dataIndex: 'en',
      key: 'en',
      sorter: (a, b) => a.country.localeCompare(b.country),
      ...getColumnSearchProps('en'),
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: cityId => cities[cityId]?.en,
      ...getColumnSearchProps('city', record => cities[record.city]?.en),
    }
  ]

  useEffect(() => {
    dispatch(fetchData())
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
          onClick={() => navigate('/teams/create')}
        >
          Create team
        </Button>
      </Row>
      <Table
        columns={columns}
        dataSource={teams}
        loading={isLoading}
        rowKey={({ id }) => id}
        onRow={record => ({
            onClick: () => navigate(`/teams/${record.id}`)
        })}
      />
    </>
  )
}
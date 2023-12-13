import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, Row, Table } from 'antd'
import { PlusCircleFilled } from '@ant-design/icons'
import { getColumnSearch } from '../../utils/components'
import { getOptions } from '../../utils/utils'
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

  const countriesOptions = useMemo(() => getOptions(Object.values(countries), 'en'), [countries])

  const columns = [
    {
      width: 200,
      title: 'Name',
      dataIndex: 'en',
      key: 'en',
      ...getColumnSearch('name', { getData: 'en' }),
    },
    {
      width: 300,
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      sorter: (a, b) => (a.country || '').localeCompare(b.country || ''),
      render: id => countries[id]?.en,
      ...getColumnSearch('country', { getData: record => countries[record.country]?.en, options: countriesOptions }),
    },
    {
      title: 'Address',
      dataIndex: 'address_en',
      key: 'address_en',
      ...getColumnSearch('address', { getData: 'address_en' }),
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
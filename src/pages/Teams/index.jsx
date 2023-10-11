import { useEffect, useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, Row, Table, Input, Space } from 'antd'
import { PlusCircleFilled, SearchOutlined } from '@ant-design/icons'
import { fetchData, getTeams } from '../../redux/data'
import { getCities, getCountries } from '../../redux/config'

export default function PageTeams() {
  const [ searchText, setSearchText ] = useState('')
  const [ searchedColumn, setSearchedColumn ] = useState('')
  const searchInput = useRef(null)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoading = useSelector(state => state.data.isLoading)
  const teams = useSelector(getTeams)
  const cities = useSelector(getCities)
  const countries = useSelector(getCountries)

  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm()
    setSearchText(selectedKeys[0])
    setSearchedColumn(dataIndex)
  }

  const handleReset = (clearFilters) => {
    clearFilters()
    setSearchText('')
  }

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type='primary'
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size='small'
            style={{ width: 90 }}
          >
            Reset
          </Button>
          <Button
            type='link'
            size='small'
            onClick={() => {
              confirm({ closeDropdown: false })
              setSearchText(selectedKeys[0])
              setSearchedColumn(dataIndex)
            }}
          >
            Filter
          </Button>
          <Button
            type='link'
            size='small'
            onClick={() => {
              close()
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes((value).toLowerCase()),
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100)
      }
    }
  })

  
const columns = [
  {
    title: 'Country',
    dataIndex: 'country',
    key: 'country',
    width: 180,
    sorter: (a, b) => a.country.localeCompare(b.country),
    render: id => countries[id].en
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
    render: cityId => cities[cityId]?.en
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
            onClick: navigate(`/teams/${record.id}`)
        })}
      />
    </>
  )
}
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Row, Table } from 'antd'
import { PlusCircleFilled } from '@ant-design/icons'
import { fetchData, getSchedule } from '../../redux/data'

const columns = [
  {
    title: 'Team home',
    dataIndex: 'team1',
    key: 'team1',
    render: team => team.en
  },
  {
    title: 'Team away',
    dataIndex: 'team2',
    key: 'team2',
    render: team => team.en
  },
  {
    title: 'Tournament',
    dataIndex: 'tournament',
    key: 'tournament',
    render: tournament => tournament.en
  },
  {
    title: 'Stadium',
    dataIndex: 'stadium',
    key: 'stadium',
    render: stadium => stadium.en
  },
  {
    title: 'Date',
    dataIndex: 'datetime',
    key: 'datetime',
    render: datetime => datetime
  }
]

export default function PageMatches() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isLoading = useSelector(state => state.data.isLoading)
  const schedule = useSelector(getSchedule)
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
          onClick={() => navigate('/matches/create')}
        >
          Create match
        </Button>
      </Row>
      <Table
        columns={columns}
        dataSource={schedule}
        loading={isLoading}
        rowKey={({ id }) => id}
        onRow={record => ({
            onClick: () => navigate(`/matches/${record.id}`)
        })}
      />
    </>
  )
}
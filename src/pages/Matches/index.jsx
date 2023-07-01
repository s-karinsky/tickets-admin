import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useParams } from 'react-router-dom'
import { Table, Col, Row, Tag } from 'antd'
import { fetchData, getSchedule } from '../../redux/data'

const columns = [
  {
    title: 'Team home',
    dataIndex: 'team1',
    key: 'team1',
    render: (team, { id }) => (<Link to={`/match/${id}`}>{team.en}</Link>)
  },
  {
    title: 'Team away',
    dataIndex: 'team2',
    key: 'team2',
    render: (team, { id }) => (<Link to={`/match/${id}`}>{team.en}</Link>)
  },
  {
    title: 'Tournament',
    dataIndex: 'tournament',
    key: 'tournament',
    render: (tournament, { id }) => (<Link to={`/match/${id}`}>{tournament.en}</Link>)
  },
  {
    title: 'Stadium',
    dataIndex: 'stadium',
    key: 'stadium',
    render: (stadium, { id }) => (<Link to={`/match/${id}`}>{stadium.en}</Link>)
  },
  {
    title: 'Date',
    dataIndex: 'datetime',
    key: 'datetime',
    render: (datetime, { id }) => (<Link to={`/match/${id}`}>{datetime}</Link>)
  }
]

export default function PageUser() {
  const dispatch = useDispatch()
  const isLoading = useSelector(state => state.data.isLoading)
  const schedule = useSelector(getSchedule)
  console.log(schedule)
  useEffect(() => {
    dispatch(fetchData())
  }, [])

  return (
    <Table
      columns={columns}
      dataSource={schedule}
      loading={isLoading}
      rowKey={({ id }) => id}
    />
  )
}
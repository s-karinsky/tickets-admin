import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Row, Space, Card, Typography, Table } from 'antd'
import { PlusCircleFilled } from '@ant-design/icons'
import { fetchTicketGroups } from '../../redux/tickets'
import { fetchData, getSchedule } from '../../redux/data'

const columns = [
  {
    title: 'Tournament',
    dataIndex: 'match',
    key: 'tournament',
    render: match => match.tournament && match.tournament.en
  },
  {
    title: 'Match',
    dataIndex: 'match',
    key: 'match',
    render: match => `${match.team1.en} — ${match.team2.en}`
  },
  {
    title: 'Tickets',
    dataIndex: 'tickets',
    key: 'tickets',
    render: tickets => `${tickets.length} ${tickets.length === 1 ? 'ticket' : 'tickets'}`
  }
]

export default function PageTickets() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const schedule = useSelector(getSchedule)
  const groups = useSelector(state => state.tickets.ticketGroups)
  const isLoading = useSelector(state => state.tickets.isLoading)
  useEffect(() => {
    dispatch(fetchTicketGroups)
  }, [])
  useEffect(() => {
    if (!schedule.length) {
      dispatch(fetchData())
    }
  }, [schedule])

  const items = useMemo(() =>
    groups.map(group => ({
      ...group,
      match: schedule[group.matchId]
    }))
  , [groups, schedule])

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
          onClick={() => navigate('/matches/add')}
        >
          Add tickets
        </Button>
      </Row>
      <Table
        columns={columns}
        dataSource={items}
        loading={isLoading}
        rowKey={({ matchId }) => matchId}
        onRow={record => ({
            onClick: () => navigate(`/tickets/${record.matchId}`)
        })}
      />
    </>
  )
}
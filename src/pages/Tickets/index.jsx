import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Row, Space, Card, Typography, List } from 'antd'
import { PlusCircleFilled } from '@ant-design/icons'
import { fetchTicketGroups } from '../../redux/tickets'
import { fetchData, getSchedule } from '../../redux/data'

function CardTitle(props) {
  const teams = `${props.team1?.en} vs. ${props.team2?.en}`
  const tournament = props.tournament?.en
  return (
    <>
      <div>{teams}</div>
      <Typography.Text type='secondary'>{tournament}</Typography.Text>
    </>
  )
}

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
      {items.map(group => (
        <Space key={group.id}>
          <Card
            title={<CardTitle {...group.match} />}
            onClick={() => navigate(`/tickets/${group.id}`)}
            hoverable
          >
            {group.tickets.map(ticket => (
              <div>
                Block <b>{ticket.block}</b>, row <b>{ticket.row}</b>, seat <b>{ticket.seat}</b> — {ticket.price}$
              </div>
            ))}
          </Card>
        </Space>
      ))}
    </>
  )
}
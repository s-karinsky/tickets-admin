import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Row, Table, Typography } from 'antd'
import { PlusCircleFilled, CaretLeftFilled } from '@ant-design/icons'
import TicketsForm from '../../components/TicketsForm'
import { fetchTicketGroups, fetchAllTickets, getMatchTickets } from '../../redux/tickets'
import { fetchData, getSchedule } from '../../redux/data'
import { getIsAdmin } from '../../redux/user'

const { Text } = Typography

const matchColumns = [
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

function MatchList({ schedule }) {
  const navigate = useNavigate()
  const groups = useSelector(getMatchTickets)
  const isLoading = useSelector(state => state.tickets.isLoading)
  
  const items = useMemo(() =>
    groups.map(group => ({
      ...group,
      match: schedule[group.matchId]
    }))
    .filter(item => item.match)
  , [groups, schedule])

  return (
    <Table
      columns={matchColumns}
      dataSource={items}
      loading={isLoading}
      rowKey={({ matchId }) => matchId}
      onRow={record => ({
          onClick: () => navigate(`/tickets/${record.matchId}`)
      })}
    />
  )
}

export default function PageTickets() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const params = useParams()
  const schedule = useSelector(getSchedule)
  const dataLoaded = useSelector(state => state.data.isLoaded)
  const isAdmin = useSelector(getIsAdmin)
  
  const isAddPage = params.matchId === 'add'
  const isMatchPage = !!params.matchId
  
  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchAllTickets)
    } else {
      dispatch(fetchTicketGroups)
    }
  }, [isAdmin])

  useEffect(() => {
    if (!Object.keys(schedule).length) {
      dispatch(fetchData())
    }
  }, [schedule])

  return (
    <>
      <Row
        style={{
          borderBottom: '1px solid #ccc',
          padding: '10px'
        }}
      >
        {isMatchPage && <Button
          icon={<CaretLeftFilled />}
          style={{ marginRight: '10px' }}
          onClick={() => navigate('/tickets')}
        >
          Back
        </Button>}
        {!isMatchPage && !isAdmin && <Button
          icon={<PlusCircleFilled />}
          style={{ marginRight: '10px' }}
          type='primary'
          onClick={() => navigate('/tickets/add')}
        >
          Add tickets
        </Button>}
      </Row>
      {!isMatchPage &&
        <MatchList
          schedule={schedule}
        />
      }
      {isMatchPage && dataLoaded &&
        <TicketsForm
          isAdmin={isAdmin}
          matchId={!isAddPage && params.matchId}
        />
      }
    </>
  )
}
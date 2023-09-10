import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Row, Table } from 'antd'
import { PlusCircleFilled, CaretLeftFilled } from '@ant-design/icons'
import TicketsForm from '../../components/TicketsForm'
import { fetchTicketGroups, getMatchTickets } from '../../redux/tickets'
import { fetchData, getSchedule } from '../../redux/data'

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

const ticketsColumns = [
  {
    title: 'Block',
    dataIndex: 'block',
    key: 'block'
  },
  {
    title: 'Row',
    dataIndex: 'row',
    key: 'row'
  },
  {
    title: 'Seat',
    dataIndex: 'seat',
    key: 'seat'
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price'
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

function TicketsList({ matchId }) {
  const { tickets } = useSelector(state => getMatchTickets(state, matchId)) || {}

  return (
    <Table
      columns={ticketsColumns}
      dataSource={tickets}
      rowKey={({ block, row, seat }) => ([block, row, seat].join(';'))}
      onRow={record => ({
          onClick: () => {}
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
  
  const isAddPage = params.matchId === 'add'
  const isMatchPage = !!params.matchId
  
  useEffect(() => {
    dispatch(fetchTicketGroups)
  }, [])

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
        {!isMatchPage && <Button
          icon={<PlusCircleFilled />}
          style={{ marginRight: '10px' }}
          type='primary'
          onClick={() => navigate('/tickets/add')}
        >
          Add tickets
        </Button>}
      </Row>
      {!isMatchPage && <MatchList schedule={schedule} />}
      {isMatchPage && dataLoaded &&
        <>
          <TicketsForm
            matchId={!isAddPage && params.matchId}
          />
          {!isAddPage && <TicketsList matchId={params.matchId} />}
        </>
      }
    </>
  )
}
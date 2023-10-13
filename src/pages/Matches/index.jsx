import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, Row, Table, Switch } from 'antd'
import { PlusCircleFilled } from '@ant-design/icons'
import { getColumnSearchProps } from '../../utils/components'
import { fetchData, getScheduleList, postData } from '../../redux/data'

const getColumns = ({ onChangeTop = () => {} }) => ([
  {
    title: 'Team home',
    dataIndex: 'team1',
    key: 'team1',
    render: team => team && team.en,
    ...getColumnSearchProps('team home', record => record.team1?.en)
  },
  {
    title: 'Team away',
    dataIndex: 'team2',
    key: 'team2',
    render: team => team && team.en,
    ...getColumnSearchProps('team away', record => record.team2?.en)
  },
  {
    title: 'Tournament',
    dataIndex: 'tournament',
    key: 'tournament',
    render: tournament => tournament && tournament.en,
    ...getColumnSearchProps('tournament', record => record.tournament?.en)
  },
  {
    title: 'Stadium',
    dataIndex: 'stadium',
    key: 'stadium',
    render: (stadium, { team1 }) => stadium ? stadium.en : team1?.stadium?.en,
    ...getColumnSearchProps('stadium', record => record.stadium?.en || record.team1?.stadium?.en)
  },
  {
    title: 'Date',
    dataIndex: 'datetime',
    key: 'datetime',
    render: datetime => datetime
  },
  {
    title: 'Top match',
    dataIndex: 'top',
    key: 'top',
    render: (top, match) => <Switch
      onClick={(val, e) => {
        e.stopPropagation()
        onChangeTop({ id: match.id, top: val })
      }}
      checked={Number(top)}
    />
  }
])

export default function PageMatches() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.user.profile)
  const isLoading = useSelector(state => state.data.isLoading)
  const schedule = useSelector(getScheduleList)
  
  useEffect(() => {
    dispatch(fetchData())
  }, [])

  const handleSwitchTop = useCallback((match) => {
    const { id, top } = match
    dispatch(postData({ schedule: [{ id, top: top ? '1' : '0' }] }))
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
        columns={getColumns({ onChangeTop: handleSwitchTop })}
        dataSource={schedule}
        loading={isLoading}
        rowKey={({ id }) => id}
        onRow={record => ({
            onClick: () => user.u_role === '4' && navigate(`/matches/${record.id}`)
        })}
      />
    </>
  )
}
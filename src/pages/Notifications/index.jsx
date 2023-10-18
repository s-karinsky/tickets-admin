import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button, Row, Table } from 'antd'
import { PlusCircleFilled } from '@ant-design/icons'
import { fetchData, fetchNotifications, getTeams, getNotifications } from '../../redux/data'
import { getCities, getCountries } from '../../redux/config'
import { getColumnSearchProps } from '../../utils/components'


const columns = [
  {
    width: 400,
    title: 'Match',
    dataIndex: 'match',
    key: 'match',
    render: match => `${match.team1.en} — ${match.team2.en}`,
    sorter: (a, b) => `${a.match?.team1?.en} — ${a.match?.team2?.en}`.localeCompare(`${b.match?.team1?.en} — ${b.match?.team2?.en}`),
    ...getColumnSearchProps('match', record => `${record.match?.team1?.en} — ${record.match?.team2?.en}`)
  },
  {
    width: 200,
    title: 'Tournament',
    dataIndex: 'match',
    key: 'tournament',
    render: match => match?.tournament?.en,
    ...getColumnSearchProps('tournament', record => record.tournament?.en)
  },
  {
    title: 'Blocks',
    dataIndex: 'blocks',
    key: 'blocks',
    render: blocks => blocks.join(', '),
    ...getColumnSearchProps('stadium', record => record.stadium?.en || record.team1?.stadium?.en)
  }
]


export default function PageNotifications() {
  const dispatch = useDispatch()
  const isLoading = useSelector(state => state.data.isFetchingNotifications)
  const notifications = useSelector(getNotifications)

  useEffect(() => {
    dispatch(fetchData())
    dispatch(fetchNotifications)
  }, [])

  return (
    <>
      <Table
        columns={columns}
        dataSource={notifications}
        loading={isLoading}
        rowKey={({ id }) => id}
      />
    </>
  )
}
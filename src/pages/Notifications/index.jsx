import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Table } from 'antd'
import { fetchData, fetchNotifications, getNotifications } from '../../redux/data'
import { getColumnSearchProps } from '../../utils/components'


const columns = [
  {
    width: 100,
    title: 'User id',
    dataIndex: 'u_id',
    key: 'user',
    ...getColumnSearchProps('u_id')
  },
  {
    width: 250,
    title: 'User name',
    dataIndex: 'user',
    key: 'name',
    render: ({ name, middle, family }) => [name, middle, family].filter(s => s).join(' '),
    ...getColumnSearchProps('name', ({ name, middle, family }) => [name, middle, family].filter(s => s).join(' '))
  },
  {
    width: 300,
    title: 'Match',
    dataIndex: 'match',
    key: 'match',
    render: match => `${match?.team1?.en} — ${match?.team2?.en}`,
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
    width: 200,
    title: 'Date',
    dataIndex: 'match',
    key: 'date',
    render: match => match?.datetime,
    sorter: (a, b) => new Date(a.match?.datetime).getTime() - new Date(b.match?.datetime).getTime()
  },
  {
    title: 'Blocks',
    dataIndex: 'blocks',
    key: 'blocks',
    render: blocks => Array.isArray(blocks) ? blocks.join(', ') : '',
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
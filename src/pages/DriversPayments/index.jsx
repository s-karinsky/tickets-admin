import { useMemo, useState } from 'react'
import { Switch, Row, Col, Button, Table, Typography, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { BsTrash } from 'react-icons/bs'
import { ExclamationCircleFilled } from '@ant-design/icons'
import axios from '../../utils/axios'
import { getColumnSearchProps } from '../../utils/components'
import { useDriversPayments, useDictionary } from '../../utils/api'
import { localeCompare, localeNumber } from '../../utils/utils'

const getColumns = ({ refetch, navigate, driversMap }) => ([
  {
    title: 'Номер',
    dataIndex: 'number',
    sorter: (a, b) => a.number - b.value,
    ...getColumnSearchProps('number')
  },
  {
    title: 'Дата',
    dataIndex: 'created_at',
    align: 'center',
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    render: date => dayjs(date).format('DD.MM.YYYY'),
    ...getColumnSearchProps('date', { type: 'date' })
  },
  {
    title: 'Перевозчик',
    dataIndex: 'driver',
    sorter: (a, b) => localeCompare(driversMap[a.driver], driversMap[b.driver]),
    render: (driver) => driversMap[driver],
    ...getColumnSearchProps(driver => driversMap[driver])
  },
  {
    title: 'Счет',
    dataIndex: 'invoice_number',
    sorter: (a, b) => a.invoice_number - b.invoice_number,
    ...getColumnSearchProps('invoice_number')
  },
  {
    title: 'К оплате ($)',
    dataIndex: 'pay_usd',
    align: 'right',
    render: pay => localeNumber(pay),
    sorter: (a, b) => a.pay_usd - b.pay_usd,
    ...getColumnSearchProps('pay_usd', { type: 'number' })
  },
  {
    title: 'К оплате (₽)',
    dataIndex: 'pay_rub',
    align: 'right',
    render: pay => localeNumber(pay),
    sorter: (a, b) => a.pay_rub - b.pay_rub,
    ...getColumnSearchProps('pay_rub', { type: 'number' })
  },
  {
    title: 'Дата учета',
    dataIndex: 'done_date',
    align: 'center',
    render: date => date && dayjs(date).format('DD.MM.YYYY'),
    sorter: (a, b) => new Date(a.done_date).getTime() - new Date(b.done_date).getTime(),
    ...getColumnSearchProps('done_date', { type: 'date' })
  },
  {
    title: 'Наименование',
    dataIndex: 'name',
    sorter: (a, b) => localeCompare(a.name, b.name),
    ...getColumnSearchProps('name')
  },
  {
    title: 'Примечание',
    dataIndex: 'note',
    sorter: (a, b) => localeCompare(a.note, b.note),
    ...getColumnSearchProps('note')
  },
  {
    title: '',
    key: 'buttons',
    render: (_, item) => {
      return (
        <nobr>
          <Button
            type='primary'
            size='small'
            style={{ marginTop: 5 }}
            onClick={() => navigate('/drivers-invoices/create', { state: { type: 'payment', id: item.id } })}
          >
            Создать счет
          </Button>
          <BsTrash
            style={{ marginLeft: 30, cursor: 'pointer' }}
            size={17}
            color='red'
            onClick={() => {
              Modal.confirm({
                title: 'Вы действительно хотите удалить этот счет?',
                icon: <ExclamationCircleFilled />,
                okText: 'Да',
                okType: 'danger',
                cancelText: 'Нет',
                onOk: async () => {
                  await axios.postWithAuth('/query/update', { sql: `update dataset set status=1 where id=${item.id}` })
                  refetch()
                }
              })
            }}
          />
        </nobr>
      )
    }
  }
])

export default function DriversPayments() {
  const [ isCash, setIsCash ] = useState()
  const { data, isLoading, refetch } = useDriversPayments()
  const navigate = useNavigate()
  const drivers = useDictionary('drivers')
  const [ driversOptions, driversMap ] = useMemo(() => {
    if (!Array.isArray(drivers.data?.list)) return [[], {}]
    const options = drivers.data.list.map(({ pole = {}, ...item }) => ({
      value: item.id,
      label: item.label
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [drivers.data])

  const filteredData = useMemo(() => (data || []).filter(item => {
    const payType = isCash ? 'Наличный' : 'Безналичный'
    return item.pay_type === payType
  }), [data, isCash])

  return (
    <>
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>Оплаты перевозчиков</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Switch
            style={{
              margin: '20px 20px 20px 0',
              transform: 'scale(140%)'
            }}
            checkedChildren='Наличные'
            unCheckedChildren='Безналичные'
            checked={isCash}
            onChange={setIsCash}
          />
          <br />
          <Button
            type='primary'
            size='large'
            onClick={() => navigate(`/drivers-payments/create`)}
          >
            Создать
          </Button>
        </Col>
      </Row>
      <Table
        size='small'
        columns={getColumns({ refetch, navigate, driversMap })}
        dataSource={filteredData}
        isLoading={isLoading}
        rowKey={({ id }) => id}
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/drivers-payments/${record.id}`)
            }
          },
        })}
      />
    </>
  )
}
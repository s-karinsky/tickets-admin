import { useEffect, useMemo } from 'react'
import { Row, Col, Button, Table, Typography, Modal } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { ExclamationCircleFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import { BsTrash } from 'react-icons/bs'
import axios from '../../utils/axios'
import { getColumnSearchProps } from '../../utils/components'
import { useDriversInvoices, useDictionary } from '../../utils/api'
import { localeCompare, localeNumber } from '../../utils/utils'

const getColumns = ({ refetch, navigate, driversMap }) => [
  {
    title: 'Номер',
    dataIndex: 'number',
    sorter: (a, b) => a.number - b.value,
    ...getColumnSearchProps('number')
  },
  {
    title: 'Дата',
    dataIndex: 'date',
    align: 'center',
    sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    render: (date) => date?.format('DD.MM.YYYY'),
    ...getColumnSearchProps('date', { type: 'date' })
  },
  {
    title: 'Клиент',
    dataIndex: 'driver',
    sorter: (a, b) => localeCompare(driversMap[a.driver], driversMap[b.driver]),
    render: (driver) => driversMap[driver],
    ...getColumnSearchProps(driver => driversMap[driver])
  },
  {
    title: 'Тип оплаты',
    dataIndex: 'pay_type',
    sorter: (a, b) => localeCompare(a.pay_type, b.pay_type),
    ...getColumnSearchProps('pay_type', { options: [{ value: 'Наличный' }, { value: 'Безналичный' }] })
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
        <div style={{ whiteSpace: 'nowrap' }}>
          <Button
            type='primary'
            size='small'
            style={{ marginTop: 5 }}
            onClick={() => navigate('/drivers-payments/create', { state: { invoice: item.id } })}
          >
            Оплатить
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
        </div>
      )
    }
  }
]

export default function DriversInvoices() {
  const { data, isLoading, refetch } = useDriversInvoices()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.refetch) {
      refetch()
    }
  }, [location.state?.refetch])

  const drivers = useDictionary('drivers')
  const [ driversOptions, driversMap ] = useMemo(() => {
    if (!Array.isArray(drivers.data)) return [[], {}]
    const options = drivers.data.map(({ pole = {}, ...item }) => ({
      value: item.id_user,
      label: `${pole.code} (${[item.family, item.name, item.middle].filter(Boolean).join(' ')})`
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [drivers.data])

  return (
    <>
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>Счета перевозчиков</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            type='primary'
            size='large'
            onClick={() => navigate(`/drivers-invoices/create`)}
          >
            Создать
          </Button>
        </Col>
      </Row>
      <Table
        size='small'
        columns={getColumns({
          refetch,
          navigate,
          driversMap
        })}
        dataSource={data}
        isLoading={isLoading}
        rowKey={({ id }) => id}
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/drivers-invoices/${record.id}`)
            }
          },
        })}
      />
    </>
  )
}
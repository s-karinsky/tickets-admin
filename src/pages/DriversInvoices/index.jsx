import { useEffect, useMemo, useState } from 'react'
import { Switch, Row, Col, Button, Table, Typography, Modal, DatePicker } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { ExclamationCircleFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import { BsTrash } from 'react-icons/bs'
import axios from '../../utils/axios'
import { getColumnSearchProps } from '../../utils/components'
import { useDriversInvoices, useDictionary } from '../../utils/api'
import { localeCompare, localeNumber } from '../../utils/utils'
import { sqlUpdate } from '../../utils/sql'

const getColumns = ({ refetch, navigate, driversMap, setModal }) => [
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
    title: 'Перевозчик',
    dataIndex: 'driver',
    sorter: (a, b) => localeCompare(driversMap[a.driver], driversMap[b.driver]),
    render: (driver) => `${driversMap[driver]}`,
    ...getColumnSearchProps(driver => driversMap[driver])
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
            style={{ marginRight: 15 }}
            size='small'
            htmlType='button'
            danger={item.pole?.done}
            onClick={() => {
              if (!item.pole?.done) {
                setModal(item)
              }
              else {
                Modal.confirm({
                  title: 'Отменить проведение счета?',
                  icon: <ExclamationCircleFilled />,
                  okText: 'Да',
                  okType: 'danger',
                  cancelText: 'Нет',
                  onOk: async () => {
                    await axios.postWithAuth('/query/update', { sql: sqlUpdate('dataset', { pole: JSON.stringify({ ...item.pole, done: false, done_date: '' }) }, `id=${item.id}`) })
                    refetch()
                  }
                })
              }
            }}
          >
            {item.pole?.done ? 'Отменить' : 'Провести'}
          </Button>
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
  const [ isCash, setIsCash ] = useState()
  const [ modal, setModal ] = useState()
  const [ doneDate, setDoneDate ] = useState(dayjs())
  const { data, isLoading, refetch } = useDriversInvoices()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.refetch) {
      refetch()
    }
  }, [location.state?.refetch])

  const filteredData = useMemo(() => (data || []).filter(item => {
    const payType = isCash ? 'Наличный' : 'Безналичный'
    return item.pay_type === payType
  }), [data, isCash])

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

  return (
    <>
      <Row align='middle' style={{ padding: '0 40px', marginBottom: 40 }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>Счета перевозчиков</Typography.Title>
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
          driversMap: driversMap || {},
          setModal
        })}
        dataSource={filteredData}
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
      {!!modal &&
        <Modal
          title='Выберите дату проведения'
          onOk={async () => {
            await axios.postWithAuth('/query/update', {
              sql: sqlUpdate('dataset', { pole: JSON.stringify({ ...modal.pole, done: true, done_date: doneDate.format('YYYY-MM-DD') }) }, `id=${modal.id}`)
            })
            refetch()
            setModal(false)
          }}
          onCancel={() => setModal(false)}
          okText='Провести'
          open
        >
          <DatePicker
            size='large'
            value={doneDate}
            onChange={val => setDoneDate(val)}
            format='DD.MM.YYYY'
            style={{ width: '100%' }}
          />
        </Modal>
      }
    </>
  )
}
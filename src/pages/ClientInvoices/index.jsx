import { useEffect, useMemo, useState } from 'react'
import { Switch, Row, Col, Button, Table, Typography, Modal, DatePicker } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { ExclamationCircleFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import { BsTrash } from 'react-icons/bs'
import axios from '../../utils/axios'
import { sqlUpdate } from '../../utils/sql'
import { getColumnSearchProps } from '../../utils/components'
import { useClientInvoices, useUsersWithRole, useUsers } from '../../utils/api'
import { localeCompare, localeNumber, getSurnameWithInitials, getPaginationSettings } from '../../utils/utils'

const getColumns = ({ refetch, navigate, clientsMap, inclientMap, setModal }) => [
  {
    title: '№',
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
    dataIndex: 'client',
    sorter: (a, b) => localeCompare(clientsMap[a.client], clientsMap[b.client]),
    render: (client) => clientsMap[client],
    ...getColumnSearchProps(client => clientsMap[client])
  },
  {
    title: 'Вн. клиент',
    dataIndex: 'inclient',
    sorter: (a, b) => localeCompare(inclientMap[a.inclient], inclientMap[b.inclient]),
    render: (inclient) => inclientMap[inclient],
    ...getColumnSearchProps(inclient => inclientMap[inclient])
  },
  {
    title: 'К оплате ($)',
    dataIndex: 'pay_usd',
    align: 'right',
    render: pay => localeNumber(pay),
    sorter: (a, b) => localeCompare(a.pay_usd - b.pay_usd),
    ...getColumnSearchProps('pay_usd', { type: 'number' })
  },
  {
    title: 'К оплате (₽)',
    dataIndex: 'pay_rub',
    align: 'right',
    render: pay => localeNumber(Math.round(pay)),
    sorter: (a, b) => a.pay_rub - b.pay_rub,
    ...getColumnSearchProps('pay_rub', { type: 'number' })
  },
  {
    title: 'Учет',
    dataIndex: 'done_date',
    align: 'center',
    sorter: (a, b) => new Date(a.done_date).getTime() - new Date(b.done_date).getTime(),
    render: (date) => date && dayjs(date).format('DD.MM.YYYY'),
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
    filters: [
      {
        text: 'Проведенные',
        value: 1
      },
      {
        text: 'Непроведенные',
        value: 0
      }
    ],
    onFilter: (value, record) => Number(record.pole?.done || false) === value,
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
            onClick={() => navigate('/client-payments/create', { state: { invoice: item.id } })}
          >
            Оплатить
          </Button>
          <BsTrash
            style={{ marginLeft: 15, cursor: item.pole?.done ? 'auto' : 'pointer' }}
            size={17}
            color={item.pole?.done ? 'gray' : 'red'}
            onClick={() => {
              if (item.pole?.done) return
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

export default function ClientInvoices() {
  const [ isCash, setIsCash ] = useState()
  const [ modal, setModal ] = useState()
  const [ doneDate, setDoneDate ] = useState(dayjs())
  const { data, isLoading, refetch } = useClientInvoices()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.state?.refetch) {
      refetch()
    }
  }, [location.state?.refetch])

  const clients = useUsersWithRole(1)
  const [ clientsOptions, clientsMap ] = useMemo(() => {
    if (!Array.isArray(clients.data)) return [[], {}]
    const options = clients.data.map(({ json = {}, ...item }) => {
      const fullname = getSurnameWithInitials(item.family, item.name, item.middle)
      return {
        value: item.id_user,
        label: `${json.code}${fullname ? ` (${fullname})` : ''}`
      }
    })
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [clients.data])

  const filteredData = useMemo(() => (data || []).filter(item => {
    const payType = isCash ? 'Наличный' : 'Безналичный'
    return item.pay_type === payType
  }), [data, isCash])

  const inclient = useUsers({ id_role: '3' })
  const [ inclientOptions, inclientMap ] = useMemo(() => {
    if (!Array.isArray(inclient.data)) return [[], {}]
    const options = inclient.data.map(({ json = {}, ...item }) => {
      const fullname = getSurnameWithInitials(item.family, item.name, item.middle)
      return {
        value: item.id_user,
        label: `${json.code}${fullname ? ` (${fullname})` : ''}`
      }
    })
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [inclient.data])

  return (
    <>
      <Row align='middle' style={{ padding: '0 40px', marginBottom: 40 }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>Счета на оплату клиентам</Typography.Title>
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
            onClick={() => navigate(`/client-invoices/create`)}
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
          clientsMap,
          inclientMap,
          setModal
        })}
        dataSource={filteredData}
        isLoading={isLoading}
        rowKey={({ id }) => id}
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/client-invoices/${record.id}`)
            }
          },
        })}
        pagination={getPaginationSettings('client-invoice')}
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
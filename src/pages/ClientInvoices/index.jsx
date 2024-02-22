import { useEffect, useMemo, useState } from 'react'
import { Row, Col, Button, Table, Typography, Modal, DatePicker } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { ExclamationCircleFilled } from '@ant-design/icons'
import dayjs from 'dayjs'
import { BsTrash } from 'react-icons/bs'
import axios from '../../utils/axios'
import { sqlUpdate } from '../../utils/sql'
import { getColumnSearchProps } from '../../utils/components'
import { useClientInvoices, useUsersWithRole, useDictionary } from '../../utils/api'
import { localeCompare, localeNumber, getSurnameWithInitials } from '../../utils/utils'

const getColumns = ({ refetch, navigate, clientsMap, inclientMap, setModal }) => [
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
    dataIndex: 'client',
    sorter: (a, b) => localeCompare(clientsMap[a.client], clientsMap[b.client]),
    render: (client) => clientsMap[client],
    ...getColumnSearchProps(client => clientsMap[client])
  },
  {
    title: 'Внутренний клиент',
    dataIndex: 'inclient',
    sorter: (a, b) => localeCompare(inclientMap[a.inclient], inclientMap[b.inclient]),
    render: (inclient) => inclientMap[inclient],
    ...getColumnSearchProps(inclient => inclientMap[inclient])
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
    sorter: (a, b) => localeCompare(a.pay_usd - b.pay_usd),
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
            style={{ marginLeft: 15, cursor: 'pointer' }}
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

export default function ClientInvoices() {
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

  const inclient = useDictionary('inclient')
  const [ inclientOptions, inclientMap ] = useMemo(() => {
    if (!Array.isArray(inclient.data?.list)) return [[], {}]
    const options = inclient.data.list.map((item) => ({
      value: item.id,
      label: [item.family, item.name, item.middle].filter(Boolean).join(' ')
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [inclient.data])

  return (
    <>
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>Счета на оплату клиентам</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
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
        dataSource={data}
        isLoading={isLoading}
        rowKey={({ id }) => id}
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/client-invoices/${record.id}`)
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
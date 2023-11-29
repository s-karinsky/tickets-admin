import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Row, Table, Typography, Input, Switch, Modal, DatePicker, Select } from 'antd'
import { useQuery } from 'react-query'
import dayjs from 'dayjs'
import { BsArrowRepeat, BsCheck2Circle, BsTrash } from 'react-icons/bs'
import { SendingsStatus } from '../../components/SendingsStatus'
import { DateTableCell } from '../../components/DateTableCell'
import axios from '../../utils/axios'
import { getSendings, deleteSendingById } from '../../utils/api'
import { getColumnSearchProps } from '../../utils/components'
import { sqlUpdate } from '../../utils/sql'
import { SENDING_STATUS } from '../../consts'

const { Title, Link } = Typography
export let PropertyGap = 10
export default function Sendings({ isSendingAir, setIsSendingAir }) {
  const navigate = useNavigate()
  const location = useLocation()

  const [ showStatusModal, setShowStatusModal ] = useState(false)
  const [ statusModalValue, setStatusModalValue ] = useState()
  const [ statusModalDate, setStatusModalDate ] = useState()
  const [ statusModalItem, setStatusModalItem ] = useState()
  const [ activeRow, setActiveRow ] = useState()
  const [ search, setSearch ] = useState('')
  const { isLoading, data, refetch } = useQuery(['sendings', { isAir: isSendingAir }], getSendings(isSendingAir))

  let sendings = (data || [])
    .filter(item => {
      if (!search) return true
      const str = Object.values(item).map(
        val => typeof(val) ==='string' && val.length >= 10 && dayjs(val).isValid() ? dayjs(val).format('DD.MM.YYYY') : val
      ).join(';').toLowerCase()
      return str.includes(search.toLowerCase())
    })
    .map(item => {
      return {
        ...item,
        'departure-date': <DateTableCell date={new Date(item.departure)} />,
        'delivery-date': <DateTableCell date={new Date(item.delivery)} />,
        buttons: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* <BsCheck2Circle size={17} color='green' /> */}
            {/* <BsArrowRepeat size={17} color='' /> */}
            <Button
              type='primary'
              size='small'
              style={{ marginTop: 5 }}
              title='Функция в разработке'
              disabled
            >
              Создать счет
            </Button>
            <BsTrash
              style={{ cursor: 'pointer' }}
              size={17}
              color='red'
              onClick={() => {
                if (!window.confirm('Delete sending?')) return
                deleteSendingById(item.id)().then(() => {
                  refetch()
                })
              }}
            />
          </div>
        ),
      }
    })

  const handleClickStatus = (item) => {
    setStatusModalValue(item.status)
    setStatusModalItem(item)
    setStatusModalDate(dayjs())
    setShowStatusModal(true)
  }

  const columns = [
    {
      title: 'Номер',
      dataIndex: 'code',
      key: 'code',
      align: 'right',
      sorter: (a, b) => a.code - b.code,
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
      render: date => <DateTableCell date={new Date(date)} />,
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ...getColumnSearchProps('date', { type: 'date' })
    },
    {
      title: 'Перевозчик',
      dataIndex: 'transporter',
      key: 'transporter',
      sorter: (a, b) => a.transporter.localeCompare(b.transporter),
      ...getColumnSearchProps('transporter', { options: [{ value: 'Александр' }, { value: 'Владимир' }] })
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => <SendingsStatus
        status={status}
        onClick={() => handleClickStatus(record)}
      />,
      sorter: (a, b) => a.status - b.status,
      ...getColumnSearchProps(record => record.status + 1, { options: SENDING_STATUS.map((label, value) => ({ value: value + 1, label })) })
    },
    {
      title: 'Количество мест',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      sorter: (a, b) => a.count - b.count,
      ...getColumnSearchProps('count', { type: 'number' })
    },
    {
      title: 'Вес брутто',
      dataIndex: 'weight',
      key: 'weight',
      align: 'right',
      sorter: (a, b) => a.weight - b.weight,
      ...getColumnSearchProps('weight', { type: 'number' })
    },
    {
      title: 'Дата отправления',
      dataIndex: 'departure-date',
      key: 'departure-date',
      sorter: (a, b) => new Date(a.departure).getTime() - new Date(b.departure).getTime(),
      ...getColumnSearchProps('departure', { type: 'date' })
    },
    {
      title: 'Дата поступления',
      dataIndex: 'delivery-date',
      key: 'delivery-date',
      sorter: (a, b) => new Date(a.delivery).getTime() - new Date(b.delivery).getTime(),
      ...getColumnSearchProps('delivery', { type: 'date' })
    },
    {
      title: '',
      dataIndex: 'buttons',
      key: 'buttons',
    },
  ]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '0 40px',
        gap: '20px',
      }}
    >
      <Row
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <Typography>
          <Title
            level={1}
            style={{ fontWeight: '700', marginBottom: '0' }}
          >
            Отправки
          </Title>

          <Link
            onClick={() => navigate(`/sendings`)}
            style={{ color: 'blue' }}
          >
            Отправка товаров
          </Link>
        </Typography>
        <Switch
          style={{
            marginBottom: 20,
            transform: 'scale(140%)',
            marginRight: 20,
          }}
          checkedChildren='Авиа'
          unCheckedChildren='Авто'
          checked={isSendingAir}
          onChange={setIsSendingAir}
        />
      </Row>
      <Row>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '20px',
            width: '100%',
          }}
        >
          <Row
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '15px',
              width: '100%',
            }}
          >
            <Input
              placeholder='Поиск'
              style={{ width: 300 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </Row>
          <Button
            type='primary'
            onClick={() => {
              navigate(location.pathname + `/create`)
            }}
            size={'large'}
          >
            Создать
          </Button>
        </div>
      </Row>
      <Table
        size='small'
        columns={columns}
        dataSource={sendings}
        loading={isLoading}
        rowKey={({ id }) => id}
        rowClassName={(r, index) => index === activeRow ? 'active-row' : ''}
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/sendings/${record.id}`)
            } else {
              setActiveRow(index)
            }
          },
        })}
      />
      <Modal
        title='Изменить статус отправки'
        open={showStatusModal}
        width={300}
        onOk={() => {
          if (!statusModalItem) return
          const json = statusModalItem.json
          json.status = statusModalValue
          axios.postWithAuth('/query/update', { sql: sqlUpdate('trip', { json: JSON.stringify(json) }, `id_trip=${statusModalItem.id}`) })
            .then(() => {
              refetch()
              setShowStatusModal(false)
            })
        }}
        onCancel={() => setShowStatusModal(false)}
      >
        <DatePicker
          size='large'
          value={statusModalDate}
          onChange={val => setStatusModalDate(val)}
          format='DD.MM.YYYY'
          style={{ width: '100%' }}
        />
        <br />
        <Select
          style={{ width: '100%', marginTop: 10 }}
          size='large'
          options={SENDING_STATUS.map((label, value) => ({ label, value }))}
          value={statusModalValue}
          onChange={val => setStatusModalValue(val)}
        />
      </Modal>
    </div>
  )
}

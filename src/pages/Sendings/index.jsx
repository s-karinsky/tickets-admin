import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Row, Table, Typography, Switch, Modal, DatePicker, Select } from 'antd'
import { ExclamationCircleFilled, CopyOutlined, DownloadOutlined } from '@ant-design/icons'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import Cookies from 'universal-cookie'
import dayjs from 'dayjs'
import { BsTrash } from 'react-icons/bs'
import { API_URL } from '../../consts'
import { SendingsStatus } from '../../components/SendingsStatus'
import { DateTableCell } from '../../components/DateTableCell'
import { getCount, getSendings, deleteSendingById, updateSendingById, useDictionary, useTemplates } from '../../utils/api'
import { declOfNum, getPaginationSettings } from '../../utils/utils'
import { getColumnSearchProps } from '../../utils/components'
import { SENDING_STATUS } from '../../consts'

const { Title, Link } = Typography
export let PropertyGap = 10

const cookies = new Cookies()

export default function Sendings() {
  const navigate = useNavigate()
  const location = useLocation()
  const [ searchParams ] = useSearchParams()
  const [ activeOnly, setActiveOnly ] = useState(true)
  const isAir = searchParams.get('air') !== null

  const [ showStatusModal, setShowStatusModal ] = useState(false)
  const [ statusModalValue, setStatusModalValue ] = useState()
  const [ statusModalDate, setStatusModalDate ] = useState()
  const [ statusModalItem, setStatusModalItem ] = useState()
  const [ activeRow, setActiveRow ] = useState()
  const { isLoading, data, refetch } = useQuery(['sendings', { isAir }], getSendings(isAir))
  const { data: { map: driverMap } = {} } = useDictionary('drivers')

  let sendings = (data || [])
    .filter(item => activeOnly ? item.status !== 2 : item.status === 2)
    .map(item => {
      const isMaking = item.status === 0
      return {
        ...item,
        'departure-date': <DateTableCell date={new Date(item.departure)} />,
        'delivery-date': <DateTableCell date={new Date(item.delivery)} />,
        buttons: (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {item.status === 2 && <Button
              type='primary'
              size='small'
              style={{ marginTop: 5 }}
              onClick={() => navigate('/client-invoices/create', { state: { type: 'sending', id: item.id } })}
              title='Функция в разработке'
              disabled
            >
              Создать счет
            </Button>}
            <form target='_blank' method='POST' action={`${API_URL}/script/template/1`}>
              <input type='hidden' value={`{"t_id": ${item.id}, "cf": "vigruzka", "da": 0 }`} name='s_t_data' />
              <input type='hidden' value={cookies.get('token')} name='token' />
              <input type='hidden' value={cookies.get('u_hash')} name='u_hash' />
              <button type='submit' style={{ background: 'none', border: 0, outline: 'none', padding: 0, cursor: 'pointer' }}>
                <DownloadOutlined
                  size={17}
                  color='#1677ff'
                />
              </button>
            </form>
            <CopyOutlined
              size={17}
              color='#141414'
              onClick={() => {
                navigate(`/sendings/create?copy=${item.id}${isAir ? '&air' : ''}`)
              }}
            />
            <BsTrash
              style={{ cursor: isMaking ? 'pointer' : 'auto' }}
              size={17}
              color={isMaking ? 'red' : '#ccc'}
              title={!isMaking && 'Удалить можно только отправку со статусом «Формирование»'}
              onClick={async () => {
                if (!isMaking) return
                const count = await getCount('dataset', { tip: 'place', id_ref: item.id })
                Modal.confirm({
                  title: 'Вы действительно хотите удалить эту отправку?',
                  icon: <ExclamationCircleFilled />,
                  content: count > 0 && <div>
                    К этой отправке {declOfNum(count, ['привязана', 'привязано', 'привязано'])} {count}&nbsp;
                    {declOfNum(count, ['запись', 'записи', 'записей'])} о местах, {count === '1' ? 'которая' : 'которые'} так же&nbsp;
                    {count === '1' ? 'будет удалена' : 'будут удалены'}
                  </div>,
                  okText: 'Да',
                  okType: 'danger',
                  cancelText: 'Нет',
                  onOk: () => deleteSendingById(item.id).then(() => refetch())
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
      align: 'center',
      render: date => dayjs(date).format('DD.MM.YYYY'),
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      ...getColumnSearchProps('date', { type: 'date' })
    },
    {
      title: 'Перевозчик',
      dataIndex: 'transporter',
      key: 'transporter',
      render: val => driverMap && driverMap[val]?.label,
      sorter: (a, b) => a.transporter.localeCompare(b.transporter),
      ...getColumnSearchProps('transporter')
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
      title: 'Мест',
      dataIndex: 'places_count',
      key: 'places_count',
      align: 'right',
      sorter: (a, b) => a.places_count - b.places_count,
      ...getColumnSearchProps('places_count', { type: 'number' })
    },
    {
      title: 'Вес брутто',
      dataIndex: 'gross_weight',
      key: 'gross_weight',
      align: 'right',
      render: val => Number(val).toFixed(3),
      sorter: (a, b) => a.gross_weight - b.gross_weight,
      ...getColumnSearchProps('gross-weight', { type: 'number' })
    },
    {
      title: 'Дата отправки',
      dataIndex: 'departure',
      key: 'departure',
      align: 'center',
      render: (date, item) => item.json?.status > 0 && dayjs(item.json?.status_date_1).format('DD.MM.YYYY'),
      sorter: (a, b) => new Date(a.departure).getTime() - new Date(b.departure).getTime(),
      ...getColumnSearchProps('departure', { type: 'date' })
    },
    {
      title: 'Дата поступления',
      dataIndex: 'delivery',
      key: 'delivery',
      align: 'center',
      render: (date, item) => item.json?.status > 1 && dayjs(item.json?.status_date_2).format('DD.MM.YYYY'),
      sorter: (a, b) => new Date(a.delivery).getTime() - new Date(b.delivery).getTime(),
      ...getColumnSearchProps('delivery', { type: 'date' })
    },
    {
      title: 'Примечание',
      dataIndex: ['json', 'note'],
      render: note => <div style={{ maxWidth: 80, maxHeight: 55, overflow: 'hidden', textOverflow: 'ellipsis' }} title={note}>{note}</div>
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
          checkedChildren='Активные'
          unCheckedChildren='Завершенные'
          checked={activeOnly}
          onChange={setActiveOnly}
        />
      </Row>
      <Row>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '20px',
            width: '100%',
          }}
        >
          <Button
            type='primary'
            onClick={() => {
              navigate(location.pathname + `/create${isAir ? '?air' : ''}`)
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
        pagination={getPaginationSettings('sendings')}
      />
      <Modal
        title='Изменить статус отправки'
        open={showStatusModal}
        width={300}
        onOk={async () => {
          if (!statusModalItem) return
          const json = {
            ...statusModalItem.json,
            status: statusModalValue,
            [`status_date_${statusModalValue}`]: statusModalDate.format('YYYY-MM-DD')
          }
          await updateSendingById(statusModalItem.id, { json: JSON.stringify(json) })
          refetch()
          setShowStatusModal(false)
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
          options={SENDING_STATUS.filter((_, i) => statusModalItem?.json?.status !== 0 || i !== 2).map((label, value) => ({ label, value }))}
          value={statusModalValue}
          onChange={val => setStatusModalValue(val)}
        />
      </Modal>
    </div>
  )
}

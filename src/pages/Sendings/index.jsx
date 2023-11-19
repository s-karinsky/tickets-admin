import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Row, Table, Typography, Input, Switch } from 'antd'
import { useQuery } from 'react-query'
import { BsArrowRepeat, BsCheck2Circle, BsTrash } from 'react-icons/bs'
import { useState } from 'react'
import { SendingsStatus } from '../../components/SendingsStatus'
import { DateTableCell } from '../../components/DateTableCell'
import { FilterModal } from '../../components/FilterModal'
import { getSendings, deleteSendingById } from '../../utils/api'

const { Title, Link } = Typography
export let PropertyGap = 10
export default function Sendings() {
  const navigate = useNavigate()
  const location = useLocation()

  const { isLoading, data, refetch } = useQuery('sendings', getSendings)

  let sendings = (data || []).map((item) => {
    return {
      ...item,
      date: <DateTableCell date={new Date(item.date)} />,
      status: <SendingsStatus status={item.status} />,
      'departure-date': <DateTableCell date={new Date(item.departure)} />,
      'delivery-date': <DateTableCell date={new Date(item.delivery)} />,
      buttons: (
        <div style={{ display: 'flex', gap: 10 }}>
          <BsCheck2Circle size={17} color='green' />
          <BsArrowRepeat size={17} color='' />
          <BsTrash
            style={{ marginLeft: 30, cursor: 'pointer' }}
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

  const [filterModalOpen, setFilterModalOpen] = useState(false)

  const columns = [
    {
      title: 'Номер',
      sorter: (a, b) => a.code - b.code,

      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Перевозчик',
      dataIndex: 'transporter',
      key: 'transporter',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Количество мест',
      dataIndex: 'count',
      sorter: (a, b) => a.count - b.count,
      key: 'count',
    },
    {
      title: 'Вес брутто',
      sorter: (a, b) => a.weight - b.weight,
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: 'Дата отправления',
      dataIndex: 'departure-date',
      key: 'departure-date',
    },
    {
      title: 'Дата поступления',
      dataIndex: 'delivery-date',
      key: 'delivery-date',
    },
    {
      title: '',
      dataIndex: 'buttons',
      key: 'buttons',
    },
  ]

  return (
    <>
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
                style={{ maxWidth: '250px' }}
              />

              <Button
                type='primary'
                size={'large'}
                style={{ backgroundColor: '#009650' }}
                onClick={() => setFilterModalOpen(true)}
              >
                Фильтры
              </Button>
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
          onRow={(record) => ({
            onClick: (e) => {
              if (e.detail === 2) {
                navigate(`/sendings/${record.id}`)
              }
            },
          })}
        />
      </div>
      <FilterModal
        isModalOpen={filterModalOpen}
        handleOk={() => setFilterModalOpen(false)}
        handleCancel={() => setFilterModalOpen(false)}
        columns={columns.filter((item) => item.title !== '')}
      />
    </>
  )
}

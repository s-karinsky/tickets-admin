import { useState } from 'react'
import { Row, Col, Button, Typography, Table, Modal, DatePicker, Select } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { BsTrash } from 'react-icons/bs'
import dayjs from 'dayjs'
import { useService, updateDatasetById } from '../../utils/api'
import { SERVICE_STATUS } from '../../consts'

const SERVICES = {
  delivery: {
    title: 'Выдача со склада',
    columns: [
      {
        title: 'Номер',
        key: 'number'
      },
      {
        title: 'Клиент',
        key: 'client'
      }
    ]
  }
}

export default function ServiceList() {
  const { serviceName } = useParams()
  const navigate = useNavigate()
  const [ showStatusModal, setShowStatusModal ] = useState(false)
  const [ statusModalValue, setStatusModalValue ] = useState()
  const [ statusModalDate, setStatusModalDate ] = useState()
  const [ statusModalItem, setStatusModalItem ] = useState()
  const { data, isLoading, refetch } = useService(serviceName)

  const handleClickStatus = (item) => {
    setStatusModalValue(item.status)
    setStatusModalItem(item)
    setStatusModalDate(dayjs())
    setShowStatusModal(true)
  }

  const columns = [
    {
      title: 'Номер',
      dataIndex: 'number'
    },
    {
      title: 'Отправка',
      dataIndex: 'sending_number'
    },
    {
      title: 'Место',
      dataIndex: ['place', 'place'],
      key: 'place'
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (val, item) => (
        <>
          {val} <Button
            onClick={() => handleClickStatus(item)}
            size='small'
            type='primary'
            ghost
          >
            Изменить
          </Button>
        </>
      )
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      render: date => dayjs(date).format('DD.MM.YYYY')
    },
    {
      title: 'Внутренний клиент',
      dataIndex: 'client'
    },
    {
      title: '',
      dataIndex: 'buttons',
      key: 'buttons',
    }
  ]

  const serviceData = (data || []).map(item => {
    return {
      ...item,
      buttons: (
        <div style={{ display: 'flex', gap: 10 }}>
          {SERVICE_STATUS.delivery.indexOf(item.status) === 0 && <BsTrash
            style={{ marginLeft: 30, cursor: 'pointer' }} 
            size={17}
            color='red'
            title='Удалить услугу'
            onClick={() => {
              Modal.confirm({
                title: 'Вы действительно хотите удалить эту услугу?',
                icon: <ExclamationCircleFilled />,
                okText: 'Да',
                okType: 'danger',
                cancelText: 'Нет',
                onOk: async () => {
                  const pole = {
                    ...item.pole,
                    is_finished: 1
                  }
                  await updateDatasetById(item.id, { status: 1, pole: JSON.stringify(pole) })
                  refetch()
                }
              })
            }}
          />}
        </div>
      )
    }
  })

  return (
    <>
      <Row align='bottom' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>{SERVICES[serviceName]?.title}</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right', paddingBottom: 20 }}>
          {/* <Button
            type='primary'
            size='large'
            onClick={() => navigate(`/services/${serviceName}/create`)}
          >
            Создать услугу
          </Button> */}
        </Col>
      </Row>
      <Table
        columns={columns}
        isLoading={isLoading}
        dataSource={serviceData}
        rowKey={({ id }) => id}
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/services/delivery/${record.id}`)
            }
          },
        })}
      />
      <Modal
        title='Изменить статус услуги'
        open={showStatusModal}
        width={300}
        onOk={async () => {
          if (!statusModalItem) return
          const statusNum = SERVICE_STATUS.delivery.indexOf(statusModalValue)
          const pole = {
            ...statusModalItem.pole,
            status: statusModalValue,
            [`date_status_${statusNum}`]: statusModalDate.format('DD.MM.YYYY'),
            is_finished: Number(statusNum === SERVICE_STATUS.delivery.length - 1)
          }
          await updateDatasetById(statusModalItem.id, { pole: JSON.stringify(pole) })
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
          options={SERVICE_STATUS.delivery.map(value => ({ value }))}
          value={statusModalValue}
          onChange={val => setStatusModalValue(val)}
        />
      </Modal>
    </>
  )
}
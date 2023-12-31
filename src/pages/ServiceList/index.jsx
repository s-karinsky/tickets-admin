import { useState, useCallback, useMemo, useEffect } from 'react'
import { Row, Col, Button, Typography, Table, Modal, DatePicker, Select, Switch } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { BsTrash } from 'react-icons/bs'
import dayjs from 'dayjs'
import { useService, updateDatasetById } from '../../utils/api'
import { SERVICE_STATUS, SERVICE_NAME } from '../../consts'

const getColumns = (name, { ocStatusClick }) => {
  const commonColumns = [
    {
      title: 'Номер',
      dataIndex: 'number'
    },
    {
      title: 'Отправка / Место',
      dataIndex: 'placeData',
      render: data => (data || []).map(item => <>{item.sending_number+' / '+item.place}<br /></>)
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (val, item) => (
        <>
          {SERVICE_STATUS[name][val]} <Button
            onClick={() => ocStatusClick(item)}
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

  return commonColumns
}

export default function ServiceList() {
  const { serviceName } = useParams()
  const navigate = useNavigate()
  const [ showStatusModal, setShowStatusModal ] = useState(false)
  const [ statusModalValue, setStatusModalValue ] = useState()
  const [ statusModalDate, setStatusModalDate ] = useState()
  const [ statusModalItem, setStatusModalItem ] = useState()
  const [ isActive, setIsActive ] = useState(true)
  const { data, isLoading, refetch } = useService(serviceName)

  const handleClickStatus = useCallback((item) => {
    setStatusModalValue(item.status)
    setStatusModalItem(item)
    setStatusModalDate(dayjs())
    setShowStatusModal(true)
  }, [])

  const columns = useMemo(
    () => getColumns(serviceName, { ocStatusClick: handleClickStatus }),
    [serviceName, handleClickStatus]
  )

  const serviceData = (data || [])
    .filter(item => Number(!item.is_finished) === Number(isActive))
    .map(item => {
      return {
        ...item,
        buttons: (
          <div style={{ display: 'flex', gap: 10 }}>
            {SERVICE_STATUS[serviceName]?.indexOf(item.status) === 0 && <BsTrash
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
          <Typography.Title style={{ fontWeight: 'bold' }}>{SERVICE_NAME[serviceName]}</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right', paddingBottom: 20 }}>
          <Switch
            style={{
              transform: 'scale(140%)',
            }}
            checkedChildren='Активные'
            unCheckedChildren='Выполненные'
            checked={isActive}
            onChange={setIsActive}
          />
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
              navigate(`/services/${serviceName}/${record.id}`)
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
          if (!statusModalDate) {
            alert('Не выбрана дата')
            return
          }
          const pole = {
            ...statusModalItem.pole,
            status: statusModalValue,
            [`date_status_${statusModalValue}`]: statusModalDate.format('DD.MM.YYYY'),
            is_finished: Number(statusModalValue === SERVICE_STATUS[serviceName]?.length - 1)
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
          options={SERVICE_STATUS[serviceName]?.map((label, value) => ({ label, value }))}
          value={statusModalValue}
          onChange={val => setStatusModalValue(val)}
        />
      </Modal>
    </>
  )
}
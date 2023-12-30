import { useState, useMemo } from 'react'
import { Modal, Select, Table } from 'antd'
import { useService } from '../../utils/api'
import axios from '../../utils/axios'
import { SERVICE_NAME } from '../../consts'

const columns = [
  {
    title: 'Отправка',
    dataIndex: 'sending_number',
    align: 'right'
  },
  {
    title: 'Место',
    dataIndex: 'place',
    key: 'place',
    align: 'right'
  },
  {
    title: 'Вес нетто',
    dataIndex: 'net_weight',
    key: 'net_weight',
    align: 'right',
    render: val => Number(val) ? Number(val).toFixed(3) : ''
  },
  {
    title: 'Вес брутто',
    dataIndex: 'gross_weight',
    key: 'gross_weight',
    align: 'right',
    render: val => Number(val) ? Number(val).toFixed(3) : ''
  },
  {
    title: 'Длина',
    dataIndex: 'size',
    key: 'length',
    render: size => typeof size === 'object' ? size.length : ''
  },
  {
    title: 'Ширина',
    dataIndex: 'size',
    key: 'width',
    render: size => typeof size === 'object' ? size.width : ''
  },
  {
    title: 'Высота',
    dataIndex: 'size',
    key: 'height',
    render: size => typeof size === 'object' ? size.height : ''
  },
  {
    title: 'Количество товара',
    dataIndex: 'count',
    key: 'count',
    align: 'right'
  }
]

export default function ServiceModal({
  client,
  type,
  placesId,
  onOk,
  onClose
}) {
  const [ activeService, setActiveService ] = useState('create')
  const services = useService({
    'JSON_EXTRACT(pole, "$.type")': type,
    'JSON_EXTRACT(pole, "$.client")': client,
    'JSON_EXTRACT(pole, "$.status")': 0
  })
  const options = useMemo(() => {
    if (services.isLoading) return []
    const list = services.data.map(({ id, pole }) => ({
      value: id,
      label: `${SERVICE_NAME[pole.type]} №${pole.number}`
    }))
    return [ { value: 'create', label: 'Новая услуга' }].concat(list)
  }, [services.data, services.isLoading])

  const places = useMemo(() => {
    if (services.isLoading || activeService === 'create') return []
    const service = services.data.find(item => item.id === activeService)
    if (!service) return []
    return service.placeData
  }, [services.data, services.isLoading, activeService])

  return (
    <Modal
      title='Выберите услугу'
      onOk={async () => {
        if (activeService !== 'create') {
          const service = services.data.find(item => item.id === activeService)
          const pole = {
            ...service.pole,
            places: placesId.concat(service.pole.places)
          }
          await axios.postWithAuth('/query/update', { sql: `UPDATE dataset SET pole='${JSON.stringify(pole)}' WHERE id=${activeService}`})
        }
        onOk(activeService)
      }}
      onCancel={onClose}
      width={700}
      open
    >
      <Select
        value={activeService}
        onSelect={setActiveService}
        options={options}
        style={{ width: '100%' }}
      />
      {activeService !== 'create' && <Table
        columns={columns}
        dataSource={places}
        rowKey={({ id }) => id}
        size='small'
        pagination={false}
      />}
    </Modal>
  )
}
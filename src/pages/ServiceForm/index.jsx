import { useMemo, useState, useEffect } from 'react'
import { Typography, Row, Col, Space, Button, Form, Table, Checkbox } from 'antd'
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { SaveOutlined } from '@ant-design/icons'
import { BiEdit } from 'react-icons/bi'
import { BsTrash } from 'react-icons/bs'
import dayjs from 'dayjs'
import FormField from '../../components/FormField'
import { VALIDATION_MESSAGES } from '../../consts'
import { numberRange } from '../../utils/validationRules'
import { getDatasetsById, useUsersWithRole, useDictionary, useService } from '../../utils/api'
import { getColumnSearchProps } from '../../utils/components'
import axios from '../../utils/axios'
import { sqlInsert, sqlUpdate } from '../../utils/sql'

const getTitle = (name, id) => {
  const isNew = id === 'create'
  switch (name) {
    case 'delivery':
      return isNew ? 'Новая выдача со склада' : `Выдача со склада №${id}`
  
    default:
      return isNew ? 'Новая услуга' : `Услуга №${id}`
  }
}

export default function ServiceForm() {
  const [ form ] = Form.useForm()
  const { serviceName, id } = useParams()
  const [ searchParams ] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()

  const isNew = id === 'create'
  const isEdit = isNew || searchParams.get('edit') !== null

  const { sendingId, sendingNum, selectedRows: datasets = [] } = location.state || {}
  const [ isGotClient, setIsGotClient ] = useState(false)

  const clients = useUsersWithRole(1)
  const internalClients = useUsersWithRole(3)
  const tarifs = useDictionary('tarif')

  const service = useService(serviceName, id, { enabled: !isNew })
  const initialValues = service.data || {}
  const datasetsId = isNew ? datasets : [initialValues.id_ref]
  const places = useQuery(['datasets', { id: datasetsId }], getDatasetsById(datasetsId), {
    enabled: isNew ? datasets.length > 0 : service.status === 'success'
  })

  useEffect(() => {
    if (initialValues.pole?.is_got_client) {
      setIsGotClient(initialValues.pole.is_got_client)
    }
  }, [initialValues])

  const [ clientsOptions, clientsMap ] = useMemo(() => {
    if (!Array.isArray(clients.data)) return [[], {}]
    const options = clients.data.map(item => ({
      value: item.id_user,
      label: item.json?.code
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [clients.data])

  const [ internalClientsOptions, internalClientsMap ] = useMemo(() => {
    if (!Array.isArray(internalClients.data)) return [[], {}]
    const options = internalClients.data.map(item => ({
      value: item.id_user,
      label: item.json?.code
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [internalClients.data])

  const handleChangeGotClient = e => setIsGotClient(e.target.checked)

  const placesData = (places.data || [])
    .map((item) => {
      return {
        ...item,
        buttons: (
          <div style={{ display: 'flex', gap: 10 }}>
            {isNew && <BsTrash
              style={{ marginLeft: 30, cursor: 'pointer' }} 
              size={17}
              color='red'
              title='Удалить место из услуги'
              onClick={() => {
                const selectedRows = datasets.filter(set => set !== item.id)
                if (selectedRows.length) {
                  navigate(location.pathname, { state: { sendingId, selectedRows } })
                }
              }}
            />}
          </div>
        ),
      }
    })
  
  const columns = [
    {
      title: 'Отправка',
      render: () => sendingNum || initialValues.sending_number,
      align: 'right'
    },
    {
      title: 'Место',
      dataIndex: 'place',
      key: 'place',
      align: 'right',
      sorter: (a, b) => a.place - b.place,
      ...getColumnSearchProps('place', { type: 'number' })
    },
    {
      title: 'Клиент',
      dataIndex: 'client',
      key: 'client',
      render: id => clientsMap[id],
      sorter: (a, b) => (clientsMap[a.client] || '').localeCompare(clientsMap[b.client] || ''),
      ...getColumnSearchProps('client', { options: clientsOptions })
    },
    {
      title: 'Вес нетто',
      dataIndex: 'net_weight',
      key: 'net_weight',
      align: 'right',
      render: val => Number(val) ? Number(val).toFixed(3) : '',
      sorter: (a, b) => a.net_weight - b.net_weight,
      ...getColumnSearchProps('net_weight', { type: 'number' })
    },
    {
      title: 'Вес брутто',
      dataIndex: 'gross_weight',
      key: 'gross_weight',
      align: 'right',
      render: val => Number(val) ? Number(val).toFixed(3) : '',
      sorter: (a, b) => a.gross_weight - b.gross_weight,
      ...getColumnSearchProps('gross_weight', { type: 'number' })
    },
    {
      title: 'Длина',
      dataIndex: 'size',
      key: 'length',
      render: size => typeof size === 'object' ? size.length : '',
      sorter: (a, b) => a.size?.length - b.size?.length
    },
    {
      title: 'Ширина',
      dataIndex: 'size',
      key: 'width',
      render: size => typeof size === 'object' ? size.width : '',
      sorter: (a, b) => a.size?.width - b.size?.width
    },
    {
      title: 'Высота',
      dataIndex: 'size',
      key: 'height',
      render: size => typeof size === 'object' ? size.height : '',
      sorter: (a, b) => a.size?.height - b.size?.height
    },
    {
      title: 'Тариф',
      dataIndex: 'tarif',
      key: 'tarif',
      render: item => tarifs.data?.map[item]?.label,
      sorter: (a, b) => (a.tarif || '').localeCompare(b.tarif || ''),
      ...getColumnSearchProps('tarif', { options: tarifs.data?.label })
    },
    {
      title: 'Количество товара',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      sorter: (a, b) => a.count - b.count,
      ...getColumnSearchProps('count', { type: 'number' })
    },
    {
      title: '',
      dataIndex: 'buttons',
      key: 'buttons',
    }
  ]

  if (!isNew && service.isLoading) return null

  return (
    <>
      <Row align='bottom' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>{getTitle(serviceName, id)}</Typography.Title>
          <Typography.Title level={2} style={{ marginTop: -20 }}>{datasets.length > 1 ? 'для мест' : 'для места'}</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right', paddingBottom: 20 }}>
          {isEdit ?
            <Space>
              <Button
                type='primary'
                size='large'
                icon={<SaveOutlined />}
                onClick={() => form.submit()}
              >
                Сохранить
              </Button>
              <Button
                type='primary'
                size='large'
                onClick={() => navigate(`/services/${serviceName}/create`)}
                danger
              >
                Отмена
              </Button>
            </Space> :
            <Space>
              <Button
                type='primary'
                size='large'
                icon={<BiEdit />}
                onClick={() => navigate(`${location.pathname}?edit`)}
              >
                Редактировать
              </Button>
              <Button
                type='primary'
                size='large'
                onClick={() => navigate(`/services/${serviceName}/create`)}
                danger
              >
                Удалить
              </Button>
            </Space>
          }
        </Col>
      </Row>
      <Table
        columns={columns}
        isLoading={places.isLoading}
        dataSource={placesData}
        rowKey={({ id }) => id}
        size='small'
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/sendings/${sendingId}/${record.id}`)
            }
          },
        })}
        pagination={false}
      />
      <Form
        validateMessages={VALIDATION_MESSAGES}
        layout='vertical'
        style={{ margin: '40px' }}
        size='large'
        form={form}
        initialValues={initialValues}
        onFinish={async (values) => {
          const initialNumber = values.pole.number
          const items = datasetsId.map((id, i) => ({
            id_ref: id,
            ref_tip: 'place',
            tip: 'service',
            status: 0,
            pole: JSON.stringify({
              ...values.pole,
              type: serviceName,
              is_finished: 0,
              number: initialNumber + i,
              is_got_client: isGotClient
            })
          }))
          let promises = []
          if (isNew) {
            promises = items.map(item => axios.postWithAuth('/query/insert', { sql: sqlInsert('dataset', item) } ))
          } else {
            promises = items.map(item => axios.postWithAuth('/query/update', { sql: sqlUpdate('dataset', item, `id=${id}`) } ))
          }
          await Promise.all(promises)
        }}
      >
        <Row gutter={10}>
          <Col span={3}>
            <FormField
              name={['pole', 'number']}
              label='Номер'
              type='number'
              rules={[{ required: true }, ...numberRange({ min: 1, max: 99999 })]}
              isEdit={isEdit}
              width='100%'
            />
          </Col>
          <Col span={4}>
            <FormField
              name={['pole', 'date']}
              label='Дата'
              type='date'
              rules={[{ required: true }]}
              isEdit={isEdit}
              width='100%'
            />
          </Col>
          <Col span={6}>
            <FormField
              type='select'
              options={internalClientsOptions}
              name={['pole', 'client']}
              label='Внутренний клиент'
              rules={[{ required: true }]}
              isEdit={isEdit}
              width='100%'
            />
          </Col>
          <Col span={6}>
            <FormField
              name={['pole', 'status']}
              type='select'
              label='Статус'
              labelType='calc'
              options={[{ value: 'Подготовка к выдаче' }, { value: 'Выдача' }, { value: 'Выдано' } ]}
              isEdit={isEdit}
              disabled={isEdit}
              width='100%'
            />
          </Col>
          <Col span={4}>
            <FormField
              name={['pole', 'delivery_date']}
              type='date'
              label='Дата выдачи'
              labelType='calc'
              isEdit={isEdit}
              disabled={isEdit}
              width='100%'
            />
          </Col>
        </Row>
        <Row gutter={10} style={{ marginTop: 20 }} align='middle'>
          <Col span={3}>
            <Checkbox
              name={['pole', 'is_got_client']}
              onChange={handleChangeGotClient}
              checked={isGotClient}
            >
              Получил клиент
            </Checkbox>
          </Col>
          <Col span={10}>
            <FormField
              label='ФИО получателя'
              name={['pole', 'got_name']}
              rules={[{ required: !isGotClient }]}
            />
          </Col>
          <Col span={10}>
            <FormField
              label='Телефон получателя'
              name={['pole', 'got_phone']}
              rules={[{ required: !isGotClient }]}
              mask='+000000000000'
              size='large'
            />
          </Col>
        </Row>
        <Row gutter={10} style={{ marginTop: 20 }}>
          <Col span={8}>
            <FormField
              label='Автомобиль получателя'
              name={['pole', 'got_car']}
            />
          </Col>
          <Col span={15}>
            <FormField
              type='textarea'
              label='Примечание'
              name={['pole', 'note']}
            />
          </Col>
        </Row>
      </Form>
    </>
  )
}
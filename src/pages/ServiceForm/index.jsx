import { useMemo, useState, useEffect } from 'react'
import { Typography, Row, Col, Space, Button, Form, Table, Checkbox } from 'antd'
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useQueries } from 'react-query'
import { SaveOutlined } from '@ant-design/icons'
import { BiEdit } from 'react-icons/bi'
import { BsTrash } from 'react-icons/bs'
import { get as _get } from 'lodash'
import FormField from '../../components/FormField'
import { VALIDATION_MESSAGES, SERVICE_STATUS } from '../../consts'
import { numberRange } from '../../utils/validationRules'
import { getDatasetsById, useUsersWithRole, useDictionary, useService, getProductsByPlaceId } from '../../utils/api'
import { getColumnSearchProps } from '../../utils/components'
import axios from '../../utils/axios'
import { sqlInsert, sqlUpdate } from '../../utils/sql'

const getTitle = (name, id) => {
  const isNew = id === 'create'
  switch (name) {
    case 'issuance':
      return isNew ? 'Новая выдача со склада' : `Выдача со склада №${id}`

    case 'delivery':
      return isNew ? 'Новая доставка' : `Доставка №${id}`
  
    default:
      return isNew ? 'Новая услуга' : `Услуга №${id}`
  }
}

export default function ServiceForm() {
  const [ form ] = Form.useForm()
  const { serviceName, id } = useParams()
  const [ searchParams, setSearchParams ] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [ dynamicRequired, setDynamicRequired ] = useState({})
  // const [ newCreated, setNewCreated ] = useState(false)
  // const [ newNumbers, setNewNumber ] = useState([])

  const isNew = id === 'create'
  const isEdit = isNew || searchParams.get('edit') !== null

  const isIssuance = () => serviceName === 'issuance'
  const isDelivery = () => serviceName === 'delivery'

  const { sendingId, sendingNum, selectedRows: datasets = [] } = location.state || {}
  const [ isGotClient, setIsGotClient ] = useState(false)

  const clients = useUsersWithRole(1)
  const drivers = useUsersWithRole(2, { enabled: isDelivery() })
  const internalClients = useUsersWithRole(3)
  const tarifs = useDictionary('tarif')

  const service = useService(serviceName, id, { enabled: !isNew })
  const initialValues = service.data || {
    pole: {
      status: _get(SERVICE_STATUS, [serviceName, 0])
    }
  }
  const datasetsId = isNew ? datasets : [initialValues.id_ref]
  const places = useQuery(['datasets', { id: datasetsId }], getDatasetsById(datasetsId), {
    enabled: isNew ? datasets.length > 0 : service.status === 'success'
  })

  const products = useQueries(datasetsId.map(placeId => ({
    queryKey: ['products', placeId],
    queryFn: getProductsByPlaceId(placeId),
    enabled: isNew ? datasets.length > 0 : service.status === 'success'
  })))

  /* useEffect(() => {
    if (!isNew) return
    async function createEmpryServices() {
      const sql = `INSERT INTO dataset (id_ref, ref_tip, tip, status) VALUES ${datasets.map(id_ref => `(${id_ref}, 'place', 'service', 1)`).join(',')}`
      await axios.postWithAuth('/query/insert', { sql })
      let response = await axios.select('dataset', '*', { where: `ref_tip="place" AND tip="service" AND status=1 AND (${datasets.map(id_ref => `id_ref=${id_ref}`).join(' OR ')})`, orderBy: 'id DESC' })
      const data = response.data?.data || []
      const refIds = data.slice(0, datasets.length).map(item => item.id)
      const year = new Date().getFullYear() - 2000
      const idSql = `INSERT INTO n_u${year} (id_ref, tip_ref) VALUES ${refIds.map(id => `(${id}, 'service')`).join(',')}`
      await axios.postWithAuth('/query/insert', { sql: idSql })
      response = await axios.select(`n_u${year}`, '*', { where: `tip_ref='service' AND ${refIds.map(id => `id_ref=${id}`).join(' OR ')}`, orderBy: 'num DESC' })
      const numbers = (response.data?.data || []).map(item => item.num)
      setNewNumber(numbers)
      setNewCreated(true)
    }
    createEmpryServices()
  }, [isNew]) */

  useEffect(() => {
    if (initialValues.pole?.is_got_client) {
      setIsGotClient(initialValues.pole.is_got_client)
    }
  }, [initialValues])

  const priceRub = Form.useWatch(['pole', 'price_rub'], form)
  const priceUsd = Form.useWatch(['pole', 'price_usd'], form)
  const driverValue = Form.useWatch(['pole', 'driver'], form)

  const [ clientsOptions, clientsMap ] = useMemo(() => {
    if (!Array.isArray(clients.data)) return [[], {}]
    const options = clients.data.map(item => ({
      value: item.id_user,
      label: item.json?.code
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [clients.data])

  const [ driverOptions, driverMap ] = useMemo(() => {
    if (!Array.isArray(drivers.data)) return [[], {}]
    const options = drivers.data.map(item => ({
      value: item.id_user,
      label: item.json?.code,
      phone: item.phone
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: { label: item.label, phone: item.phone } }), {})
    return [ options, map ]
  }, [drivers.data])

  const [ internalClientsOptions ] = useMemo(() => {
    if (!Array.isArray(internalClients.data)) return [[], {}]
    const options = internalClients.data.map(item => ({
      value: item.id_user,
      label: item.json?.code
    }))
    return [ options ]
  }, [internalClients.data])

  const handleChangeGotClient = e => setIsGotClient(e.target.checked)

  const placesData = (places.data || [])
    .map((item) => {
      const placeProducts = products.find(product => _get(product, 'data.0.id_ref') === item.id)?.data || []
      const net_weight = placeProducts.reduce((sum, product) => sum + (product.net_weight * product.count), 0)
      const count = placeProducts.reduce((sum, product) => sum + product.count, 0)
      return {
        ...item,
        count,
        net_weight,
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
  // if (isNew && !newCreated) return null

  return (
    <>
      <Row align='bottom' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>{getTitle(serviceName, id)}</Typography.Title>
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
                onClick={() => isNew ? navigate('/services/issuance') : setSearchParams({})}
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
              {/* <Button
                type='primary'
                size='large'
                onClick={() => navigate(`/services/${serviceName}/create`)}
                danger
              >
                Удалить
              </Button> */}
            </Space>
          }
        </Col>
      </Row>
      <Form
        validateMessages={VALIDATION_MESSAGES}
        layout='vertical'
        style={{ margin: '40px' }}
        size='large'
        form={form}
        initialValues={initialValues}
        onValuesChange={values => {
          if (_get(values, ['pole', 'delivery_type']) === 'Адрес клиента') {
            setDynamicRequired({ ...dynamicRequired, client_address: true, terminal_address: false, terminal_phone: false })
          }
          if (_get(values, ['pole', 'delivery_type']) === 'Терминал') {
            setDynamicRequired({ ...dynamicRequired, client_address: false, terminal_address: true, terminal_phone: true })
          }
        }}
        onFinish={async (values) => {
          const initialNumber = values.pole.number
          const add = {}
          if (isDelivery) {
            add.driver_phone = driverMap[driverValue]?.phone
          }
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
              is_got_client: isGotClient,
              ...add
            })
          }))
          let promises = []
          if (isNew) {
            promises = items.map(item => axios.postWithAuth('/query/insert', { sql: sqlInsert('dataset', item) } ))
          } else {
            promises = items.map(item => axios.postWithAuth('/query/update', { sql: sqlUpdate('dataset', item, `id=${id}`) } ))
          }
          await Promise.all(promises)
          navigate(`/services/${serviceName}`)
        }}
      >
        <Row gutter={[10, 20]} align='middle'>
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
              text={initialValues.pole?.date?.format('DD.MM.YYYY')}
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
              text={initialValues?.pole?.client}
              isEdit={isEdit}
              width='100%'
            />
          </Col>
          <Col span={6}>
            <FormField
              name={['pole', 'status']}
              label='Статус'
              labelType='calc'
              isEdit={isEdit}
              disabled={isEdit}
              width='100%'
            />
          </Col>
          <Col span={4}>
            <FormField
              name={['pole', 'date_status_2']}
              label='Дата выдачи'
              labelType='calc'
              isEdit={isEdit}
              disabled={isEdit}
              width='100%'
            />
          </Col>
          {isDelivery() && <>
            <Col span={3}>
              <FormField
                name={['pole', 'delivery_type']}
                label='Тип доставки'
                type='select'
                options={[{ value: 'Терминал' }, { value: 'Адрес клиента' }]}
                isEdit={isEdit}
                text={initialValues.pole?.delivery_type}
              />  
            </Col>
            <Col span={4}>
              <FormField
                name={['pole', 'terminal_phone']}
                label='Телефон терминала'
                rules={[ { required: dynamicRequired.terminal_phone }]}
                mask='+00000000000'
                size='large'
                isEdit={isEdit}
              />  
            </Col>
            <Col span={8}>
              <FormField
                name={['pole', 'terminal_address']}
                label='Адрес терминала'
                rules={[ { required: dynamicRequired.terminal_address }]}
                isEdit={isEdit}
              />  
            </Col>
            <Col span={8}>
              <FormField
                name={['pole', 'client_address']}
                label='Адрес доставки клиента'
                rules={[ { required: dynamicRequired.client_address }]}
                isEdit={isEdit}
              />  
            </Col>
          </>}
          <Col span={3}>
            <Checkbox
              name={['pole', 'is_got_client']}
              onChange={handleChangeGotClient}
              checked={isGotClient}
              disabled={!isEdit}
            >
              Получил клиент
            </Checkbox>
          </Col>
          <Col span={10}>
            <FormField
              label='ФИО получателя'
              name={['pole', 'got_name']}
              rules={[{ required: !isGotClient }]}
              isEdit={isEdit}
            />
          </Col>
          <Col span={10}>
            <FormField
              label='Телефон получателя'
              name={['pole', 'got_phone']}
              rules={[{ required: !isGotClient }]}
              isEdit={isEdit}
              mask='+000000000000'
              size='large'
            />
          </Col>
          {isDelivery() && <>
            <Col span={3}>
              <FormField
                label='Тип оплаты'
                name={['pole', 'pay_type']}
                type='select'
                options={[{ value: 'Бесплатно' }, { value: 'Наличными' }, { value: 'Безналичными' }]}
                rules={[ { required: true }]}
                isEdit={isEdit}
                text={initialValues.pole?.pay_type}
              />
            </Col>
            <Col span={3}>
              <FormField
                label='Сумма оплаты (₽)'
                type='number'
                addonAfter={isEdit && '₽'}
                name={['pole', 'price_rub']}
                disabled={!!priceUsd}
                isEdit={isEdit}
              />
            </Col>
            <Col span={3}>
              <FormField
                label='Сумма оплаты ($)'
                type='number'
                addonAfter={isEdit && '$'}
                name={['pole', 'price_usd']}
                disabled={!!priceRub}
                isEdit={isEdit}
              />
            </Col>
            <Col span={7}>
              <FormField
                name={['pole', 'driver']}
                label='Перевозчик'
                type='select'
                options={driverOptions}
                text={driverMap[initialValues.pole?.driver]?.label}
                isEdit={isEdit}
                rules={[ { required: true } ]}
              />
            </Col>
            <Col span={7}>
              <FormField
                label='Телефон перевозчика'
                value={driverMap[driverValue]?.phone}
                isEdit={isEdit}
                rules={[ { required: true } ]}
                disabled
              />
            </Col>
          </>}
          {isIssuance() && <Col span={9}>
            <FormField
              label='Автомобиль получателя'
              name={['pole', 'got_car']}
              isEdit={isEdit}
            />
          </Col>}
          <Col span={14}>
            <FormField
              type='textarea'
              label='Примечание'
              name={['pole', 'note']}
              isEdit={isEdit}
            />
          </Col>
        </Row>
      </Form>
      <Typography.Title level={2} style={{ padding: '0 40px' }}>{datasets.length > 1 ? 'для мест' : 'для места'}</Typography.Title>
      <Table
        columns={columns}
        isLoading={places.isLoading}
        dataSource={placesData}
        rowKey={({ id }) => id}
        size='small'
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/sendings/${sendingId || initialValues.sending_id}/${record.id}`)
            }
          },
        })}
        pagination={false}
      />
    </>
  )
}
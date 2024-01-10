import { useMemo, useState, useEffect } from 'react'
import { Typography, Row, Col, Space, Button, Form, Table, Checkbox, Select, Modal, Dropdown } from 'antd'
import { useParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useQueries } from 'react-query'
import { SaveOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { BiEdit } from 'react-icons/bi'
import { BsTrash } from 'react-icons/bs'
import dayjs from 'dayjs'
import { get as _get, set as _set } from 'lodash'
import FormField from '../../components/FormField'
import { VALIDATION_MESSAGES, SERVICE_STATUS } from '../../consts'
import { numberRange } from '../../utils/validationRules'
import { getDatasetsById, useUsersWithRole, useDictionary, useService, getProductsByPlaceId, getCount } from '../../utils/api'
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

    case 'fullfillment':
      return isNew ? 'Новый фулфилмент' : `Фулфилмент №${id}`

    case 'storage':
      return isNew ? 'Новое хранение' : `Хранение №${id}`
  
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
  const [ selectedRows, setSelectedRows ] = useState([])
  const [ newPlaces, setNewPlaces ] = useState([])

  const isNew = id === 'create'
  const isEdit = isNew || searchParams.get('edit') !== null

  const isIssuance = () => serviceName === 'issuance'
  const isDelivery = () => serviceName === 'delivery'
  const isFullFill = () => serviceName === 'fullfillment'
  const isStorage = () => serviceName === 'storage'
  const isRepack = () => serviceName === 'repack'

  const { selectedRows: datasets = [] } = location.state || {}
  const [ isGotClient, setIsGotClient ] = useState(false)

  const clients = useUsersWithRole(1)
  const { data: { list: driverOptions, map: driverMap } = {} } = useDictionary('drivers', {}, { enabled: isDelivery() })
  const internalClients = useUsersWithRole(3)
  const tarifs = useDictionary('rates')

  const service = useService(serviceName, id, {
    refetchOnWindowFocus: false
  })
  const initialValues = service.data || {}
  if (initialValues) {
    initialValues.statusName = SERVICE_STATUS[serviceName][initialValues?.pole?.status]
  }
  const datasetsId = isNew ? datasets : (initialValues.places || [])
  const places = useQuery(['datasets', { id: datasetsId }], getDatasetsById(datasetsId, true), {
    enabled: isNew ? datasets.length > 0 : service.status === 'success'
  })

  const products = useQueries(datasetsId.map(placeId => ({
    queryKey: ['products', placeId],
    queryFn: getProductsByPlaceId(placeId),
    enabled: isNew ? datasets.length > 0 : service.status === 'success'
  })))

  useEffect(() => {
    if (serviceName !== 'repack' || isNew) return
    const { new_places } = initialValues
    getDatasetsById(new_places, true)().then(places => {
      setNewPlaces(places)
    })
  }, [initialValues.new_places, serviceName, isNew])

  useEffect(() => {
    if (!initialValues) return
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
        net_weight
      }
    })

  const expandedRowRender = item => {
    const childColumns = [
      {
        title: 'Наименование',
        dataIndex: 'name',
        key: 'name',
        sorter: (a, b) => a.name.localeCompare(b.name),
        ...getColumnSearchProps('name')
      },
      {
        title: 'Вес нетто',
        dataIndex: 'net_weight',
        key: 'net_weight',
        align: 'right',
        sorter: (a, b) => a.net_weight - b.net_weight,
        ...getColumnSearchProps('net_weight', { type: 'number' })
      },
      {
        title: 'Количество',
        dataIndex: 'count',
        key: 'count',
        align: 'right',
        sorter: (a, b) => a.count - b.count,
        ...getColumnSearchProps('count', { type: 'number' })
      },
      {
        title: 'Цена',
        dataIndex: 'price',
        key: 'price',
        align: 'right',
        sorter: (a, b) => a.price - b.price,
        render: val => Number(val) ? Number(val).toFixed(2) : null,
        ...getColumnSearchProps('price', { type: 'number' })
      },
      {
        title: 'Сумма',
        dataIndex: 'sum',
        key: 'sum',
        align: 'right',
        sorter: (a, b) => a.sum - b.sum,
        render: val => Number(val) ? Number(val).toFixed(2) : null,
        ...getColumnSearchProps('sum', { type: 'number' })
      },
      {
        title: '',
        dataIndex: 'buttons',
        key: 'buttons',
        render: (_, product) => (
          (isNew || item.status === 0) && isEdit && <div style={{ display: 'flex', gap: 10 }}>
            <BsTrash
              style={{ marginLeft: 30, cursor: 'pointer' }} 
              size={17}
              color='red'
              title='Удалить товар из нового места'
              onClick={() => {
                Modal.confirm({
                  title: 'Вы действительно хотите удалить этот товар из нового места?',
                  icon: <ExclamationCircleFilled />,
                  okText: 'Да',
                  okType: 'danger',
                  cancelText: 'Нет',
                  onOk: () => {
                    const placeIndex = newPlaces.findIndex(p => p.id === item.id)
                    const child = newPlaces[placeIndex].child.filter(c => c.id !== product.id)
                    const updatedPlaces = [ ...newPlaces ]
                    updatedPlaces[placeIndex].child = child
                    updatedPlaces[placeIndex].net_weight = child.reduce((sum, c) => sum + (c.net_weight * c.count), 0)
                    setNewPlaces(updatedPlaces)
                  }
                })
              }}
            />
          </div>
        )
      },
    ]

    return <Table columns={childColumns} dataSource={item.child} pagination={false} />
  }
  
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
    }
  ]

  if (isStorage()) {
    columns.push({
      title: 'Дата отправки',
      dataIndex: ['sending', 'status_date_1'],
      key: 'sending_date',
      render: date => date && dayjs(date).format('DD.MM.YYYY')
    })
  }

  columns.push({
    title: '',
    dataIndex: 'buttons',
    key: 'buttons',
    render: (_, item) => (
      <div style={{ display: 'flex', gap: 10 }}>
        {(isNew || item.status === 0) && isEdit && <BsTrash
          style={{ marginLeft: 30, cursor: 'pointer' }} 
          size={17}
          color='red'
          title='Удалить место из услуги'
          onClick={() => {
            const isNewPlace = !item.id_ref || item.id_ref === '0'
            Modal.confirm({
              title: 'Вы действительно хотите удалить это место из услуги?',
              icon: <ExclamationCircleFilled />,
              okText: 'Да',
              okType: 'danger',
              cancelText: 'Нет',
              onOk: async () => {
                if (isNewPlace) {
                  const places = newPlaces.filter(p => p.id === item.id)
                  setNewPlaces(places)
                  return
                }
                if (isNew) {
                  const selectedRows = datasets.filter(set => set !== item.id)
                  if (selectedRows.length) {
                    navigate(location.pathname, { state: { selectedRows } })
                  }
                } else {
                  const pole = JSON.stringify({ ...initialValues.pole, places: initialValues.places.filter(place => String(item.id) === place) })
                  await axios.postWithAuth('/query/update', { sql: sqlUpdate('dataset', { pole }, `id=${id}`) })
                  navigate(location.pathname)
                }
              }
            })
          }}
        />}
      </div>
    )
  })

  if (service.isFetching) return null

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
              {initialValues?.pole?.is_finished === 0 &&
                <Button
                  type='primary'
                  size='large'
                  icon={<BiEdit />}
                  onClick={() => navigate(`${location.pathname}?edit`)}
                >
                  Редактировать
                </Button>
              }
              {initialValues?.pole?.is_finished === 1 && !isIssuance() && !isDelivery() && <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'issuance',
                        label: 'Выдача со склада',
                        onClick: () => navigate('/services/issuance/create', { state: { selectedRows: (isRepack() ? newPlaces : placesData).map(item => item.id) } })
                      },
                      {
                        key: 'delivery',
                        label: 'Доставка',
                        onClick: () => navigate('/services/delivery/create', { state: { selectedRows: (isRepack() ? newPlaces : placesData).map(item => item.id) } })
                      },
                      {
                        key: 'fullfillment',
                        label: 'Фулфилмент',
                        onClick: () => navigate('/services/fullfillment/create', { state: { selectedRows: (isRepack() ? newPlaces : placesData).map(item => item.id) } })
                      }
                    ].concat(
                      isRepack() ? [{
                        key: 'storage',
                        label: 'Хранение',
                        onClick: () => navigate('/services/storage/create', { state: { selectedRows: (isRepack() ? newPlaces : placesData).map(item => item.id) } })
                      }] : [])
                    .filter(item => item.key !== serviceName)
                  }}
                >
                  <Button
                    type='primary'
                    size='large'
                  >
                    Создать услугу
                  </Button>
                </Dropdown>
              }
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
          const client = placesData[0].client
          const add = {}
          if (isDelivery) {
            add.driver_phone = driverMap[driverValue]?.phone
          }
          if (!values.pole.status) {
            values.pole.status = 0
          }

          const pole = {
            ...values.pole,
            type: serviceName,
            is_finished: 0,
            is_got_client: isGotClient,
            client,
            ...add,
            places: datasetsId
          }

          if (isRepack()) {
            const placesKeys = ['tip', 'pole']
            const productKeys = ['tip', 'pole', 'id_ref', 'ref_tip']
            const promises = newPlaces.map(
              p => axios.postWithAuth('/query/insert', {
                sql: `INSERT INTO dataset (${placesKeys.join(',')}) VALUES (${placesKeys.map(key => `'${p[key]}'`).join(',')})`
              }).then(res => ({ [p.id]: res.data?.data?.id }))
            )
            const res = await Promise.all(promises)
            const placesMap = res.reduce((acc, item) => ({ ...acc, ...item }), {})
            pole.new_places = Object.values(placesMap).map(String)
            const products = newPlaces.reduce((p, item) => ([...p, ...item.child.map(c => ({ ...c, id_ref: placesMap[c.id_ref], pole: JSON.stringify(c.pole) }))]), [])
            const insertProducts = `INSERT INTO dataset (${productKeys.join(',')}) VALUES (${products.map(p => productKeys.map(key => `'${p[key]}'`).join(',')).join('),(')})`
            await axios.postWithAuth('/query/insert', { sql: insertProducts })
          }

          const item = {
            ref_tip: 'place',
            tip: 'service',
            status: 0,
            pole: JSON.stringify(pole)
          }
          const response = await axios.postWithAuth(`/query/${isNew ? 'insert' : 'update'}`, { sql: isNew ? sqlInsert('dataset', item) : sqlUpdate('dataset', item, `id=${id}`) })
          if (isNew) {
            const id = response.data?.data?.id || ''
            navigate(`/services/${serviceName}/${id}`)
          } else {
            setSearchParams({})
            service.refetch()
          }
        }}
      >
        <Row gutter={[10, 20]} align='middle'>
          <Col span={3}>
            <FormField
              name={['pole', 'number']}
              label='Номер'
              type='number'
              dependencies={['pole.date']}
              rules={
                [
                  { required: true },
                  ...numberRange({ min: 1, max: 99999 }),
                  ({ getFieldValue }) => ({
                    validator: async (_, id) => {
                      if (!isNew && parseInt(id) === parseInt(initialValues?.pole?.number)) return Promise.resolve()
                      const count = await getCount('dataset', {
                        '$.pole.number': id,
                        tip: 'service',
                        status: 0,
                        'YEAR(SUBSTR(JSON_EXTRACT(pole, "$.date"), 2, 22))': `YEAR('${getFieldValue(['pole', 'date'])?.format('YYYY-MM-DD')}')`
                      })
                      return count > 0 ? Promise.reject(new Error('Номер уже используется')) : Promise.resolve()
                    },
                  })
                ]
              }
              isEdit={isEdit}
              width='100%'
            />  
          </Col>
          <Col span={isStorage() ? 3 : 4}>
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
          <Col span={isStorage() ? 4 : 6}>
            <FormField
              type='select'
              options={internalClientsOptions}
              name={['pole', 'client']}
              label='Внутренний клиент'
              text={initialValues?.pole?.client}
              isEdit={isEdit}
              width='100%'
            />
          </Col>
          <Col span={isStorage() ? 4 : 6}>
            <FormField
              name={['statusName']}
              label='Статус'
              labelType='calc'
              isEdit={isEdit}
              disabled={isEdit}
              width='100%'
            />
          </Col>
          {!isStorage() && <Col span={4}>
            <FormField
              name={['pole', `date_status_${SERVICE_STATUS[serviceName]?.length - 1}`]}
              label={isFullFill() ? 'Дата передачи' : 'Дата выдачи'}
              labelType='calc'
              isEdit={isEdit}
              disabled={isEdit}
              width='100%'
            />
          </Col>}
          {isStorage() && <>
            <Col span={3}>
              <FormField
                type='date'
                label='Дата начала'  
                name={['pole', 'start_date']}
                isEdit={isEdit}
                text={initialValues.pole?.start_date?.format('DD.MM.YYYY')}
              />
            </Col>
            <Col span={3}>
              <FormField
                type='date'
                label='Дата окончания'  
                name={['pole', 'end_date']}
                isEdit={isEdit}
                text={initialValues.pole?.end_date?.format('DD.MM.YYYY')}
              />
            </Col>
            <Col span={3}>
              <FormField
                width='100%'
                type='number'
                label='Дней хранения'
                disabled={isEdit}
                isEdit={isEdit}
              />
            </Col>
          </>}
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
          {!isFullFill() && !isStorage() && !isRepack() && <>
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
          </>}
          {(!isIssuance()) && <>
            {isFullFill() && <Col span={4}>
              <FormField
                name={['pole', 'merketplace']}
                label='Маркетплейс'
                type='select'
                options={[{ value: 'Wilberries' }, { value: 'OZON' }, { value: 'Яндекс' }]}
                rules={[{ required: true }]}
                isEdit={isEdit}
                text={initialValues.pole?.merketplace}
              />
            </Col>}
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
            {isDelivery() && <Col span={7}>
              <FormField
                name={['pole', 'driver']}
                label='Перевозчик'
                type='select'
                options={driverOptions}
                text={driverMap && driverMap[initialValues.pole?.driver]?.value}
                isEdit={isEdit}
                rules={[ { required: true } ]}
              />
            </Col>}
            {isDelivery() && <Col span={7}>
              <FormField
                label='Телефон перевозчика'
                value={driverMap && driverMap[driverValue]?.phone}
                isEdit={isEdit}
                rules={[ { required: true } ]}
                disabled
              />
            </Col>}
            {isFullFill() && <Col span={5}>
              <FormField
                name={['pole', 'getter_name']}
                label='ФИО представителя'
                isEdit={isEdit}
              />
            </Col>}
            {isFullFill() && <Col span={5}>
              <FormField
                name={['pole', 'getter_phone']}
                label='Телефон представителя'
                isEdit={isEdit}
              />
            </Col>}
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
      <Row align='bottom' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title level={2}>
            {isRepack() ? 'Первичные места' : (datasetsId.length > 1 ? 'для мест' : 'для места')}
          </Typography.Title>
        </Col>
        {isRepack() && isEdit && <Col span={12} style={{ textAlign: 'right', paddingBottom: 20 }}>
          <Button
            type='primary'
            disabled={!selectedRows.length}
            onClick={() => {
              const items = placesData.filter(item => selectedRows.includes(item.id))
              setNewPlaces(newPlaces.concat(items))
              setSelectedRows([])
            }}
          >
            Создать новое место
          </Button>
        </Col>}
      </Row>
      <Table
        columns={columns}
        isLoading={places.isLoading}
        dataSource={placesData}
        rowKey={({ id }) => id}
        size='small'
        rowSelection={{
          type: Checkbox,
          onChange: selectedKeys => setSelectedRows(selectedKeys),
          getCheckboxProps: item => ({
            disabled: newPlaces.find(place => place.id === item.id)
          })
        }}
        pagination={false}
      />
      {isRepack() && <>
        <Typography.Title level={2} style={{ padding: '0 40px' }}>Новые места</Typography.Title>
        <Table
          columns={columns.slice(2)}
          dataSource={newPlaces}
          rowKey={({ id }) => id}
          size='small'
          expandable={{ expandedRowRender, defaultExpandAllRows: true }}
          pagination={false}
        />
      </>}
    </>
  )
}
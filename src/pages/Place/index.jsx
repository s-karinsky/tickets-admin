import { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useQueries } from 'react-query'
import { Button, Row, Table, Typography, Input, Form, Modal, Space, Divider, message } from 'antd'
import { BsTrash } from 'react-icons/bs'
import { BiEdit } from 'react-icons/bi'
import { SaveOutlined, CopyOutlined, ExclamationCircleFilled, LoadingOutlined, CheckOutlined } from '@ant-design/icons'
import { PropertyGap } from '../Sendings'
import CreateProductModal from './СreateProductModal'
import FormField from '../../components/FormField'
import { useDictionary, useUsersWithRole, getLastId, getCount, getSendingById, getPlaceById, deletePlaceById, updateDatasetById, createDataset, getProductsByPlaceId, deleteProductById } from '../../utils/api'
import { SENDING_STATUS, SERVICE_NAME } from '../../consts'
import { getColumnSearchProps } from '../../utils/components'
import { required, numberRange } from '../../utils/validationRules'
import { declOfNum, numberFormatter, getPaginationSettings, filterOption, localeNumber, getSurnameWithInitials } from '../../utils/utils'

const { Title, Link } = Typography

export default function Place({ user }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [ searchParams, setSearchParams ] = useSearchParams()
  const { sendingId, placeId } = useParams()
  const [ form ] = Form.useForm()

  const [ isProductChanged, setIsProductChanged ] = useState(false)
  const [ editProduct, setEditProduct ] = useState(false)
  const [ activeRow, setActiveRow ] = useState()
  const [ isSumDisabled, setIsSumDisabled ] = useState()
  const [ customPay, setCustomPay ] = useState('')
  const [ messageApi, contextHolder ] = message.useMessage()

  const copy = searchParams.get('copy')

  const [ sendingData, placeData, productsData ] = useQueries([
    {
      queryKey: ['sending', sendingId],
      queryFn: getSendingById(sendingId)
    },
    {
      queryKey: ['place', sendingId, placeId, { copy }],
      queryFn: getPlaceById(placeId, sendingId, { copy }),
      cacheTime: 0
    },
    {
      queryKey: ['products', placeId],
      queryFn: getProductsByPlaceId(placeId)
    }
  ])
  const clients = useUsersWithRole(1)
  const tarifs = useDictionary('rates')

  const rate = Form.useWatch('tarif', form)
  
  useEffect(() => {
    const item = (tarifs.data?.list || []).find(item => item.value === rate)
    if (!item) return

    form.setFieldValue('pay_type', item.pay_type)
    form.setFieldValue('pay_kg', item.price_kg)
  }, [rate, tarifs.data?.list])

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

  const isNew = placeId === 'create'
  const isEditPage = isNew || searchParams.get('edit') !== null
  const initialPlace = useMemo(() => ({
    ...placeData.data,
    pay_sum: (placeData.data?.pay_kg || 0) * (placeData.data?.gross_weight || 0),
    status: sendingData.data?.json?.status,
    net_weight: (productsData.data || []).reduce((sum, item) => sum + item.net_weight, 0),
    items_sum: (productsData.data || []).reduce((sum, item) => sum + (item.sum || 0), 0),
    count: (productsData.data || []).reduce((sum, item) => sum + (item.count || 0), 0)
  }), [placeData, productsData, sendingData])

  useEffect(() => {
    if (!isProductChanged) return
    form.setFieldsValue(initialPlace)
    setIsProductChanged(false)
  }, [isProductChanged, setIsProductChanged, form, initialPlace])

  const isNotSending = sendingData.data?.json?.status === 0

  useEffect(() => {
    if (initialPlace.pay_type !== 'Безналичный') setIsSumDisabled(true)
  }, [initialPlace.pay_type])

  const maxNum = (productsData.data || []).reduce((max, item) => Math.max(item.number, max), 0)

  const places = (productsData.data || [])
    .map((item) => {
      const { number, ...record } = item
      return {
        ...item,
        buttons: (
          isNotSending && <div style={{ display: 'flex', gap: 10 }}>
            <CopyOutlined
              size={17}
              color='#141414'
              onClick={() => {
                setEditProduct(record)
              }}
            />
            <BsTrash
              style={{ marginLeft: 30, cursor: 'pointer' }}
              size={17}
              color='red'
              onClick={() => {
                Modal.confirm({
                  title: 'Вы действительно хотите удалить этот товар?',
                  icon: <ExclamationCircleFilled />,
                  okText: 'Да',
                  okType: 'danger',
                  cancelText: 'Нет',
                  onOk() {
                    deleteProductById(item.id).then(() => {
                      productsData.refetch()
                    })
                  }
                })
              }}
            />
          </div>
        ),
      }
    })

  const columns = [
    {
      title: 'Номер',
      dataIndex: 'number',
      key: 'number',
      align: 'right',
      sorter: (a, b) => a.code - b.code,
    },
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      ...getColumnSearchProps('name')
    },
    {
      title: 'ЧЗ',
      dataIndex: 'mark',
      render: mark => mark ? <CheckOutlined /> : ''
    },
    {
      title: 'Вес нетто',
      dataIndex: 'net_weight',
      key: 'net_weight',
      align: 'right',
      render: weight => localeNumber(weight),
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
      render: val => Number(val) ? localeNumber(Number(val).toFixed(2)) : null,
      ...getColumnSearchProps('price', { type: 'number' })
    },
    {
      title: 'Сумма',
      dataIndex: 'sum',
      key: 'sum',
      align: 'right',
      sorter: (a, b) => a.sum - b.sum,
      render: val => Number(val) ? localeNumber(Number(val).toFixed(2)) : null,
      ...getColumnSearchProps('sum', { type: 'number' })
    },
    {
      title: 'Примечание',
      dataIndex: 'note',
      key: 'note',
      sorter: (a, b) => (a.note || '').localeCompare(b.note || ''),
      ...getColumnSearchProps('note')
    },
    {
      title: '',
      dataIndex: 'buttons',
      key: 'buttons',
    },
  ]

  const placeTitle = isNew ? 'Новое место' : `№${initialPlace?.place}`

  const isDataLoaded = !sendingData.isLoading && !placeData.isLoading && !productsData.isLoading

  const handleSubmit = useCallback(async (values) => {
    const params = {
      tip: 'place',
      id_ref: Number(sendingId),
      ref_tip: 'sending',
      pole: JSON.stringify(values),
      creator_id: Number(user.u_id),
      editor_id: Number(user.u_id),
      status: 0
    }
    if (placeId === 'create') {
      const result = await createDataset(params)
      if (result.status === 'error') {
        Modal.error({
          title: 'Ошибка при сохранении',
          content: result.message
        })
      } else {
        const id = await getLastId('dataset')
        navigate(`/sendings/${sendingId}/${id}`)
      }
    } else {
      const result = await updateDatasetById(placeId, params)
      if (result.status === 'error') {
        Modal.error({
          title: 'Ошибка при сохранении',
          content: result.message
        })
      } else {
        await placeData.refetch()
        messageApi.open({
          type: 'success',
          content: 'Запись успешно обновлена'
        })
        setSearchParams()
      }
    }
  }, [sendingId, placeId, user, placeData, navigate, setSearchParams])

  return (
    <>
      {contextHolder}
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
            gap: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <Typography>
            {isDataLoaded ?
              <Title
                level={1}
                style={{ fontWeight: '700', marginBottom: '0' }}
              >
                {isNew ? placeTitle : `Место ${placeTitle}`}
              </Title> :
              <Title
                level={1}
                style={{ fontWeight: '700', marginBottom: '0' }}
              >
                <LoadingOutlined />
              </Title>
            }
            {isDataLoaded && <div>
              <Link
                onClick={() => navigate(`/sendings${sendingData?.data?.to === '1' ? '?air' : ''}`)}
                style={{ color: 'blue' }}
              >
                Отправка товаров <span> </span>&gt;
              </Link>
              <Link
                onClick={() =>
                  navigate(
                    location.pathname
                      .toString()
                      .split('/')
                      .slice(0, -1)
                      .join('/')
                  )
                }
                style={{ color: 'blue' }}
              >
                <span> </span>
                Отправка №{sendingData.data?.from}
                <span> </span>
                &gt;<span> </span>
              </Link>
              {isNew ? placeTitle : `Место ${placeTitle}`}
            </div>}
          </Typography>
          <Row
            style={{
              gap: 20,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
              marginBottom: 20,
            }}
          >
            {!isNotSending &&
              <Button
                style={{
                  gap: 10,
                  display: 'flex',
                  alignItems: 'center',
                }}
                type='primary'
                size={'large'}
                onClick={() => form.submit()}
              >
                Сохранить
                <SaveOutlined size={16} />
              </Button>
            }
            {isEditPage ? (
              <>
                <Button
                  style={{
                    gap: 10,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  type='primary'
                  size={'large'}
                  onClick={() => form.submit()}
                >
                  Сохранить
                  <SaveOutlined size={16} />
                </Button>
                <Button
                  size={'large'}
                  style={{
                    gap: 10,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  type='primary'
                  danger
                  onClick={() => isNew ? navigate(`/sendings/${sendingId}`) : setSearchParams()}
                >
                  Отмена
                </Button>
              </>
            ) : (
              isNotSending && <>
                <Button
                  style={{
                    gap: 10,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  type='primary'
                  size={'large'}
                  onClick={() => navigate('?edit')}
                >
                  Редактировать
                  <BiEdit size={16} />
                </Button>
                <Button
                  size={'large'}
                  style={{
                    gap: 10,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  type='primary'
                  onClick={async () => {
                    const count = places.length
                    Modal.confirm({
                      title: 'Вы действительно хотите удалить это место?',
                      icon: <ExclamationCircleFilled />,
                      content: count > 0 && <div>
                        К этому месту {declOfNum(count, ['привязан', 'привязано', 'привязано'])} {count}&nbsp;
                        {declOfNum(count, ['товар', 'товара', 'товаров'])}, {count === '1' ? 'который' : 'которые'} так же&nbsp;
                        {count === '1' ? 'будет удален' : 'будут удалены'}
                      </div>,
                      okText: 'Да',
                      okType: 'danger',
                      cancelText: 'Нет',
                      onOk: () => deletePlaceById(placeId).then(() => { navigate(`/sendings/${sendingId}`) })
                    })
                  }}
                  danger
                >
                  Удалить
                  <BsTrash size={16} />
                </Button>
              </>
            )}
          </Row>
        </Row>

        <Row
          style={{
            display: 'flex',
            gap: `${PropertyGap}px`,
            borderRadius: 20,
            backgroundColor: '#FAFAFA',
            padding: 20,
            boxShadow: '0px 2px 4px 0px #00000026',
          }}
        >
          {isDataLoaded &&(
            <Form
              style={{ display: 'block', width: '100%' }}
              layout='vertical'
              size='large'
              initialValues={initialPlace}
              onFinish={handleSubmit}
              onValuesChange={(values, allValues) => {
                if (values.pay_type) setIsSumDisabled(values.pay_type !== 'Безналичный')
                if (values.pay_kg || values.gross_weight) {
                  const sum = (allValues.pay_kg || 0) * (allValues.gross_weight || 0)
                  form.setFieldValue('pay_sum', sum)
                }
              }}
              form={form}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <FormField
                  width={200}
                  type='number'
                  label='Место'
                  name='place'
                  isEdit={isEditPage}
                  rules={
                    [
                      ...required(),
                      ...numberRange({ min: 1 }),
                      ({ getFieldValue }) => ({
                        validator: async (_, id) => {
                          if (!isNew && parseInt(id) === parseInt(initialPlace.place)) return Promise.resolve()
                          const count = await getCount('dataset', {
                            '$.pole.client': getFieldValue('client'),
                            '$.pole.tarif': getFieldValue('tarif'),
                            '$.pole.place': id,
                            id_ref: sendingId,
                            tip: 'place',
                            status: 0
                          })
                          return count > 0 ? Promise.reject(new Error('Место уже занято')) : Promise.resolve()
                        },
                      })
                    ]
                  }
                />
                <FormField
                  type='select'
                  label='Клиент'
                  name='client'
                  style={{ width: 200 }}
                  options={clientsOptions}
                  text={clientsMap[initialPlace.client]}
                  isEdit={isEditPage}
                  rules={required()}
                  filterOption={filterOption}
                  showSearch
                />
                <FormField
                  type='select'
                  label='Статус места'
                  labelType='calc'
                  name='status'
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  options={SENDING_STATUS.map((name, i) => ({ label: name, value: i }))}
                  text={SENDING_STATUS[sendingData.data?.json?.status]}
                  disabled={isEditPage}
                />
                <FormField 
                  label='Статус услуги'
                  labelType='calc'
                  value={[SERVICE_NAME[initialPlace.service?.type], initialPlace.service?.status].filter(item => item).join(' → ')}
                  style={{ width: 420 }}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                />
                <FormField
                  type='number'
                  label='Длина'
                  width={127}
                  name={['size', 'length']}
                  isEdit={isEditPage}
                  rules={[...required(), ...numberRange({ min: 1 })]}
                  addonAfter={'см'}
                />
                <FormField
                  type='number'
                  label='Ширина'
                  width={127}
                  name={['size', 'width']}
                  isEdit={isEditPage}
                  rules={[...required(), ...numberRange({ min: 1 })]}
                  addonAfter={'см'}
                />
                <FormField
                  type='number'
                  label='Высота'
                  width={127}
                  name={['size', 'height']}
                  isEdit={isEditPage}
                  rules={[...required(), ...numberRange({ min: 1 })]}
                  addonAfter={'см'}
                />
                <FormField 
                  type='select'
                  label='Тариф'
                  name='tarif'
                  style={{ width: 200 }}
                  options={tarifs.data?.list || []}
                  text={(tarifs.data?.map || {})[initialPlace.tarif]?.label}
                  isEdit={isEditPage}
                  rules={required()}
                  showSearch
                />
                <FormField
                  type='select'
                  label='Тип оплаты'
                  name='pay_type'
                  style={{ width: 200 }}
                  options={[
                    { value: 'Наличный', title: '' },
                    { value: 'Безналичный', title: '' },
                  ].concat(customPay ? { value: customPay } : [])}
                  text={initialPlace.pay_type}
                  isEdit={isEditPage}
                  rules={required()}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      <Divider style={{ margin: '8px 0' }} />
                      <Space style={{ padding: '0 8px 4px' }}>
                        <Input
                          placeholder='Произвольный тип'
                          value={customPay}
                          onChange={e => setCustomPay(e.target.value)}
                        />
                      </Space>
                    </>
                  )}
                />
                <FormField
                  type='number'
                  label='Цена за 1 кг'
                  name='pay_kg'
                  addonAfter={'$'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  formatter={numberFormatter(2)}
                />
                <FormField
                  type='number'
                  label='Сумма товара'
                  name='items_sum'
                  addonAfter={'$'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  disabled={isSumDisabled}
                  formatter={numberFormatter(2)}
                />
                <FormField
                  type='number'
                  label='Сумма оплаты'
                  labelType='calc'
                  name='pay_sum'
                  addonAfter={'$'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}  
                  formatter={numberFormatter(2)}
                  disabled={isEditPage}
                />
                <FormField
                  type='number'
                  label='Вес нетто'
                  labelType='sum'
                  name='net_weight'
                  addonAfter={'кг'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                  rules={numberRange({ min: 0, max: 99999 })}
                  formatter={numberFormatter(3)}
                />
                <FormField
                  type='number'
                  label='Вес брутто'
                  name='gross_weight'
                  addonAfter={'кг'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  rules={numberRange({ min: 0, max: 99999 })}
                  formatter={numberFormatter(3)}
                />
                <FormField
                  type='number'
                  label='Количество товара'
                  labelType='sum'
                  name='count'
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                  rules={numberRange({ min: 0, max: 99999 })}
                />
              </div>
              <FormField
                type='textarea'
                label='Примечание'
                name='note'
                isEdit={!isNotSending || isEditPage}
                text={initialPlace.note}
              />
            </Form>
          )}
        </Row>
        {!isNew &&
          <>
            <Row>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  gap: '20px',
                  width: '100%',
                }}
              >
                <Title
                  level={1}
                  style={{ fontWeight: '700', marginBottom: '0' }}
                >
                  Товары
                </Title>
                {isNotSending && <Button
                  type='primary'
                  onClick={() => setEditProduct(true)}
                  size={'large'}
                >
                  Создать
                </Button>}
              </div>
            </Row>
            <Table
              size='small'
              columns={columns}
              isLoading={productsData.isLoading}
              rowClassName={(r, index) => index === activeRow ? 'active-row' : ''}
              dataSource={places}
              rowKey={({ id }) => id}
              onRow={(record, index) => ({
                onClick: (e) => {
                  if (e.detail === 2) {
                    setEditProduct(record)
                  } else {
                    setActiveRow(index)
                  }
                },
              })}
              style={{ overflow: 'scroll' }}
              pagination={getPaginationSettings('place')}
            />
          </>
        }
      </div>
      {!!editProduct && <CreateProductModal
        title={editProduct === true ? 'Создать товар' : 'Редактировать товар'}
        isModalOpen={!!editProduct}
        handleCancel={() => {
          setEditProduct(false)
          productsData.refetch().then(() => setIsProductChanged(true))
        }}
        placeId={placeId}
        userId={user.u_id}
        product={editProduct}
        maxNum={maxNum}
        isSumDisabled={initialPlace.pay_type !== 'Безналичный'}
        isNotSending={isNotSending}
      />}
    </>
  )
}

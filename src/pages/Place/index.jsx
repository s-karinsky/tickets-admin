import { useCallback, useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useQueries } from 'react-query'
import { Button, Row, Table, Typography, Input, Checkbox, Form, Modal, Space, Divider } from 'antd'
import { useSelector } from 'react-redux'
import { BsTrash } from 'react-icons/bs'
import { BiEdit } from 'react-icons/bi'
import { SaveOutlined, CopyOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { get as _get } from 'lodash'
import { PropertyGap } from '../Sendings'
import CreateProductModal from './СreateProductModal'
import FormField from '../../components/FormField'
import { filterTableRows } from '../../utils/utils'
import { useUsersWithRole, getCount, getSendingById, getPlaceById, deletePlaceById, updateDatasetById, createDataset, getProductsByPlaceId, deleteProductById } from '../../utils/api'
import { SENDING_STATUS } from '../../consts'
import { getUserProfile } from '../../redux/user'
import { getColumnSearchProps } from '../../utils/components'
import { required, numberRange } from '../../utils/validationRules'

const { Title, Link } = Typography

export default function Place() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector(getUserProfile)
  const [ searchParams, setSearchParams ] = useSearchParams()
  const { sendingId, placeId } = useParams()
  const [ form ] = Form.useForm()

  const [ search, setSearch ] = useState('')
  const [ editProduct, setEditProduct ] = useState(false)
  const [ activeRow, setActiveRow ] = useState()
  const [ isSumDisabled, setIsSumDisabled ] = useState()
  const [ customPay, setCustomPay ] = useState('')

  const [ sendingData, placeData, productsData ] = useQueries([
    {
      queryKey: ['sending', sendingId],
      queryFn: getSendingById(sendingId)
    },
    {
      queryKey: ['place', sendingId, placeId],
      queryFn: getPlaceById(placeId, sendingId)
    },
    {
      queryKey: ['products', placeId],
      queryFn: getProductsByPlaceId(placeId)
    }
  ])
  const clients = useUsersWithRole(1)

  const [ clientsOptions, clientsMap ] = useMemo(() => {
    if (!Array.isArray(clients.data)) return [[], {}]
    const options = clients.data.map(item => ({
      value: item.id_user,
      label: [item.family, item.name, item.middle].join(' ')
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [clients.data])

  const isNew = placeId === 'create'
  const isEditPage = isNew || searchParams.get('edit') !== null

  const initialPlace = {
    ...placeData.data,
    status: sendingData.data?.json?.status,
    net_weight: (productsData.data || []).reduce((sum, item) => sum + item.net_weight || 0, 0),
    count: (productsData.data || []).reduce((sum, item) => sum + item.count || 0, 0)
  }

  const isNotSending = sendingData.data?.json?.status === 0

  useEffect(() => {
    if (initialPlace.pay_type !== 'Безналичный') setIsSumDisabled(true)
  }, [initialPlace.pay_type])

  const maxNum = (productsData.data || []).reduce((max, item) => Math.max(item.number, max), 0)

  const places = (productsData.data || [])
    .filter(filterTableRows(search))
    .map((item) => {
      return {
        ...item,
        buttons: (
          isNotSending && <div style={{ display: 'flex', gap: 10 }}>
            <CopyOutlined size={17} color='#141414' />
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
      ...getColumnSearchProps('name')
    },
    {
      title: 'Вес нетто',
      dataIndex: 'net_weight',
      key: 'net_weight',
      align: 'right',
      ...getColumnSearchProps('net_weight', { type: 'number' })
    },
    {
      title: 'Количество',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      ...getColumnSearchProps('count', { type: 'number' })
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: val => Number(val) ? Number(val).toFixed(2) : null,
      ...getColumnSearchProps('price', { type: 'number' })
    },
    {
      title: 'Сумма',
      dataIndex: 'sum',
      key: 'sum',
      align: 'right',
      render: val => Number(val) ? Number(val).toFixed(2) : null,
      ...getColumnSearchProps('sum', { type: 'number' })
    },
    {
      title: 'Примечание',
      dataIndex: 'note',
      key: 'note',
      ...getColumnSearchProps('note')
    },
    {
      title: '',
      dataIndex: 'buttons',
      key: 'buttons',
    },
  ]

  const placeTitle = isNew ? 'Новое место' : `№${initialPlace?.place}`

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
      await createDataset(params)
      navigate(`/sendings/${sendingId}`)
    } else {
      await updateDatasetById(placeId, params)
      await placeData.refetch()
      setSearchParams()
    }
  }, [sendingId, placeId, user])

  if (placeData.isFetching && isNew) return null

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
            gap: 20,
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
              {isNew ? placeTitle : `Место ${placeTitle}`}
            </Title>
            <div className=''>
              <Link
                onClick={() => navigate(`/sendings`)}
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
                <span> </span>Отправка №{sendingData.data?.from}<span> </span>
                &gt;<span> </span>
              </Link>
              {isNew ? placeTitle : `Место ${placeTitle}`}
            </div>
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
                  onClick={() => {
                    if (!window.confirm('Delete place?')) return
                    deletePlaceById(placeId)().then(() => {
                      navigate(`/sendings/${sendingId}`)
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
            boxShadow: ' 0px 2px 4px 0px #00000026',
          }}
        >
          {!sendingData.isLoading && !placeData.isLoading && (
            <Form
              style={{ display: 'block', width: '100%' }}
              layout='vertical'
              size='large'
              initialValues={initialPlace}
              onFinish={handleSubmit}
              onValuesChange={values => values.pay_type && setIsSumDisabled(values.pay_type !== 'Безналичный')}
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
                      () => ({
                        validator: async (_, id) => {
                          if (!isNew && parseInt(id) === parseInt(initialPlace.place)) return Promise.resolve()
                          const count = await getCount('dataset', `JSON_EXTRACT(pole,'$.place')='${id}' AND id_ref=${sendingId} AND ref_tip='sending' AND status=0`)
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
                  type='select'
                  label='Статус услуги'
                  labelType='calc'
                  name='service_status'
                  style={{ width: 200 }}
                  options={[
                    { value: 'В обработке', title: '' },
                    { value: 'Выдано', title: '' },
                  ]}
                  text={initialPlace.service_status}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                />
                <FormField 
                  type='select'
                  label='Тариф'
                  name='tarif'
                  style={{ width: 200 }}
                  options={[
                    { value: 'Экспресс', title: '' },
                    { value: 'Эконом', title: '' },
                  ]}
                  text={initialPlace.tarif}
                  isEdit={isEditPage}
                  rules={required()}
                />
                <Form.Item
                  label={<b>Размер</b>}
                  style={{ width: 420 }}
                >
                  <div style={{ width: 420, display: 'flex', gap: 5 }}>
                    <FormField
                      type='number'
                      width={120}
                      name={['size', 'length']}
                      isEdit={isEditPage}
                      rules={required()}
                      addonAfter={isEditPage && 'см'}
                    />
                    <span style={{ lineHeight: '39px' }}>x</span>
                    <FormField
                      type='number'
                      width={120}
                      name={['size', 'width']}
                      isEdit={isEditPage}
                      rules={required()}
                      addonAfter={isEditPage && 'см'}
                    />
                    <span style={{ lineHeight: '39px' }}>x</span>
                    <FormField
                      type='number'
                      width={120}
                      name={['size', 'height']}
                      isEdit={isEditPage}
                      rules={required()}
                      addonAfter={isEditPage && 'см'}
                    />
                  </div>
                </Form.Item>
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
                  addonAfter={isEditPage && '$'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  formatter={(val) => Number(val).toFixed(2)}
                />
                <FormField
                  type='number'
                  label='Сумма товара'
                  name='items_sum'
                  addonAfter={isEditPage && '$'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  disabled={isSumDisabled}
                  formatter={(val) => Number(val).toFixed(2)}
                />
                <FormField
                  type='number'
                  label='Сумма оплаты'
                  labelType='calc'
                  name='pay_sum'
                  addonAfter={isEditPage && '$'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}  
                  formatter={(val) => Number(val).toFixed(2)}
                  disabled={isEditPage}
                />
                <FormField
                  type='number'
                  label='Вес нетто'
                  labelType='sum'
                  name='net_weight'
                  addonAfter={isEditPage && 'кг'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                  rules={numberRange({ min: 0, max: 99999 })}
                  formatter={(val) => Number(val).toFixed(3)}
                />
                <FormField
                  type='number'
                  label='Вес брутто'
                  name='gross_weight'
                  addonAfter={isEditPage && 'кг'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  rules={numberRange({ min: 0, max: 99999 })}
                  formatter={(val) => Number(val).toFixed(3)}
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
                isEdit={isEditPage}
                text={initialPlace.note}
              />
            </Form>
          )}
        </Row>
        {!isNew &&
          <>
            <Row>
              <Title
                level={1}
                style={{ fontWeight: '700', marginBottom: '0' }}
              >
                Товары
              </Title>
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
              rowSelection={{
                type: Checkbox,
              }}
            />
          </>
        }
      </div>
      {!!editProduct && <CreateProductModal
        title={editProduct === true ? 'Создать товар' : 'Редактировать товар'}
        isModalOpen={!!editProduct}
        handleCancel={() => {
          setEditProduct(false)
          productsData.refetch()
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

import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useQueries } from 'react-query'
import { Button, Row, Table, Typography, Input, Checkbox, Form, Modal, Space, Divider } from 'antd'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'
import { BsTrash } from 'react-icons/bs'
import { BiEdit } from 'react-icons/bi'
import { SaveOutlined, CopyOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { get as _get } from 'lodash'
import { PropertyGap } from '../Sendings'
import CreateProductModal from './СreateProductModal'
import FormField from '../../components/FormField'
import { getSendingById, getPlaceById, deletePlaceById, getProductsByPlaceId, deleteProductById } from '../../utils/api'
import { SENDING_STATUS } from '../../consts'
import { getUserProfile } from '../../redux/user'
import { sqlInsert, sqlUpdate } from '../../utils/sql'
import { getColumnSearchProps } from '../../utils/components'
import { required, numberRange } from '../../utils/validationRules'
import axios from '../../utils/axios'

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
      queryKey: ['place', placeId],
      queryFn: getPlaceById(placeId)
    },
    {
      queryKey: ['products', placeId],
      queryFn: getProductsByPlaceId(placeId)
    }
  ])

  const isNew = placeId === 'create'
  const isEditPage = isNew || searchParams.get('edit') !== null

  const initialPlace = {
    ...placeData.data,
    status: sendingData.data?.json?.status,
    net_weight: (productsData.data || []).reduce((sum, item) => sum + item.net_weight || 0, 0),
    gross_weight: (productsData.data || []).reduce((sum, item) => sum + item.gross_weight || 0, 0),
    count: (productsData.data || []).reduce((sum, item) => sum + item.count || 0, 0)
  }

  useEffect(() => {
    if (initialPlace.pay_type !== 'Безналичный') setIsSumDisabled(true)
  }, [initialPlace.pay_type])

  const maxNum = (productsData.data || []).reduce((max, item) => Math.max(item.number, max), 1)

  const places = (productsData.data || [])
    .filter(item => {
      if (!search) return true
      const str = Object.values(item).map(
        val => typeof(val) ==='string' && val.length >= 10 && dayjs(val).isValid() ? dayjs(val).format('DD.MM.YYYY') : val
      ).join(';').toLowerCase()
      return str.includes(search.toLowerCase())
    })
    .map((item) => {
      return {
        ...item,
        buttons: (
          <div style={{ display: 'flex', gap: 10 }}>
            {/* <BiInfoCircle size={17} color='#141414' /> */}
            {/* <AiOutlineMore size={17} color="#141414" /> */}
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
      title: 'Марка',
      dataIndex: 'label',
      key: 'label',
      ...getColumnSearchProps('label')
    },
    {
      title: 'Артикул',
      dataIndex: 'article',
      key: 'article',
      ...getColumnSearchProps('article')
    },
    {
      title: 'Цвет',
      dataIndex: 'color',
      key: 'color',
      ...getColumnSearchProps('color')
    },
    {
      title: 'Размер',
      dataIndex: 'size',
      key: 'size',
      align: 'right',
      ...getColumnSearchProps('size')
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
      await axios.postWithAuth('/query/insert', { sql: sqlInsert('dataset', params) })
      navigate(`/sendings/${sendingId}`)
    } else {
      await axios.postWithAuth('/query/update', { sql: sqlUpdate('dataset', params, `id=${placeId}`) })
      placeData.refetch()
      setSearchParams()
    }
  }, [sendingId, placeId, user])

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
              <>
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
              onValuesChange={values => setIsSumDisabled(values.pay_type !== 'Безналичный')}
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
                  label='Место'
                  name='place'
                  isEdit={isEditPage}
                  rules={required()}
                />
                <FormField
                  type='select'
                  label='Клиент'
                  name='client'
                  style={{ width: 200 }}
                  options={[
                    { value: 'Александр', title: 'Aktr' },
                    { value: 'Владимир', title: 'Ak2tr' },
                  ]}
                  text={initialPlace.client}
                  isEdit={isEditPage}
                  rules={required()}
                />
                <FormField
                  type='select'
                  label={<><sup>ƒ</sup>&nbsp;Статус места</>}
                  name='status'
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  options={SENDING_STATUS.map((name, i) => ({ label: name, value: i }))}
                  text={SENDING_STATUS[initialPlace.status]}
                  disabled
                />
                <FormField 
                  type='select'
                  label='Статус услуги'
                  name='service_status'
                  style={{ width: 200 }}
                  options={[
                    { value: 'В обработке', title: '' },
                    { value: 'Выдано', title: '' },
                  ]}
                  text={initialPlace.service_status}
                  isEdit={isEditPage}
                />
                <FormField
                  type='select'
                  label='Услуги'
                  name='services'
                  style={{ width: 200 }}
                  options={[
                    { value: 'В обработке', title: '' },
                    { value: 'Выдача со склада', title: '' },
                  ]}
                  text={initialPlace.services}
                  isEdit={isEditPage}
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
                  name='pay_sum'
                  addonAfter={isEditPage && '$'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}  
                  formatter={(val) => Number(val).toFixed(2)}
                />
                <FormField
                  label='Размер'
                  name='size'
                  addonAfter={isEditPage && 'см'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}  
                  rules={required()}
                />
                <FormField
                  type='number'
                  label={<><sup>∑</sup>&nbsp;Вес нетто</>}
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
                  label={<><sup>∑</sup>&nbsp;Вес брутто</>}
                  name='gross_weight'
                  addonAfter={isEditPage && 'кг'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                  rules={numberRange({ min: 0, max: 99999 })}
                  formatter={(val) => Number(val).toFixed(3)}
                />
                <FormField
                  type='number'
                  label={<><sup>∑</sup>&nbsp;Количество товара</>}
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
            <Button
              type='primary'
              onClick={() => setEditProduct(true)}
              size={'large'}
            >
              Создать
            </Button>
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
        isSumDisabled={isSumDisabled}
      />}
    </>
  )
}

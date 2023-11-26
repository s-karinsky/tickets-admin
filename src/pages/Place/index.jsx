import { useCallback, useState } from 'react'
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useQueries } from 'react-query'
import {
  Button,
  Row,
  Table,
  Typography,
  Input,
  Select,
  Checkbox,
  Form,
} from 'antd'
import { useSelector } from 'react-redux'
import TextArea from 'antd/es/input/TextArea'
import { BsTrash } from 'react-icons/bs'
import { BiInfoCircle, BiEdit } from 'react-icons/bi'
import { SaveOutlined, CopyOutlined } from '@ant-design/icons'
import { get as _get } from 'lodash'
import { FilterModal } from '../../components/FilterModal'
import { PropertyGap } from '../Sendings'
import CreateProductModal from './СreateProductModal'
import FormField from '../../components/FormField'
import { getSendingById, getPlaceById, deletePlaceById, getProductsByPlaceId, deleteProductById } from '../../utils/api'
import { SENDING_STATUS } from '../../consts'
import { getUserProfile } from '../../redux/user'
import { sqlInsert, sqlUpdate } from '../../utils/sql'
import axios from '../../utils/axios'

const { Title, Link } = Typography

const propLabels = {
  id: 'Номер',
  status: 'Статус / услуга',
  place: 'Место',
  client: 'Клиент',
  tarif: 'Тариф',
  count: 'Количество',
  net_weight: 'Вес нетто',
  gross_weight: 'Вес брутто',
  size: 'Размер',
  pay_type: 'Тип оплаты',
  pay_kg: 'Цена за 1 кг',
  pay_sum: 'Сумма оплаты',
  items_sum: 'Сумма товара',
  note: 'Примечание'
}

export default function Sending() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector(getUserProfile)
  const [ searchParams, setSearchParams ] = useSearchParams()
  const { sendingId, placeId } = useParams()
  const [ form ] = Form.useForm()

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

  const places = (productsData.data || []).map((item) => {
    return {
      ...item,
      buttons: (
        <div style={{ display: 'flex', gap: 10 }}>
          <BiInfoCircle size={17} color='#141414' />
          {/* <AiOutlineMore size={17} color="#141414" /> */}
          <CopyOutlined size={17} color='#141414' />
          <BsTrash
            style={{ marginLeft: 30, cursor: 'pointer' }}
            size={17}
            color='red'
            onClick={() => {
              if (!window.confirm('Delete product?')) return
              deleteProductById(item.id).then(() => {
                productsData.refetch()
              })
            }}
          />
        </div>
      ),
    }
  })
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [editProduct, setEditProduct] = useState(false)
  const [nextPage, setNextPage] = useState(0)

  const columns = [
    {
      title: 'Номер',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.code - b.code,
    },
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Марка',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: 'Артикул',
      dataIndex: 'article',
      key: 'article',
    },
    {
      title: 'Цвет',
      dataIndex: 'color',
      key: 'color',
    },
    {
      title: 'Размер',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Количество',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Цена',
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: 'Сумма',
      dataIndex: 'sum',
      key: 'sum',
    },
    {
      title: '',
      dataIndex: 'buttons',
      key: 'buttons',
    },
  ]

  const placeTitle = isNew ? 'Новое место' : location.pathname.toString().split('/').slice(-1).join('/')

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
                <span> </span>Отправка<span> </span>
                {location.pathname
                  .toString()
                  .split('/')
                  .slice(-2, -1)
                  .join('/')}
                <span> </span>
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
                  onClick={() => setSearchParams()}
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
                />
                <FormField
                  label='Место'
                  name='place'
                  isEdit={isEditPage}
                />
                <FormField
                  type='select'
                  label='Статус места'
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
                />
                <FormField
                  type='select'
                  label='Тип оплаты'
                  name='pay_type'
                  style={{ width: 200 }}
                  options={[
                    { value: 'Наличный', title: '' },
                    { value: 'Безналичный', title: '' },
                  ]}
                  text={initialPlace.pay_type}
                  isEdit={isEditPage}
                />
                <FormField
                  type='number'
                  label='Цена за 1 кг'
                  name='pay_kg'
                  addonAfter={isEditPage && '$'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                />
                <FormField
                  type='number'
                  label='Сумма товара'
                  name='items_sum'
                  addonAfter={isEditPage && '$'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}  
                />
                <FormField
                  type='number'
                  label='Сумма оплаты'
                  name='pay_sum'
                  addonAfter={isEditPage && '$'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}  
                />
                <FormField
                  type='number'
                  label='Размер'
                  name='size'
                  addonAfter={isEditPage && 'см'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}  
                />
                <FormField
                  type='number'
                  label='Вес нетто'
                  name='net_weight'
                  addonAfter={isEditPage && 'кг'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                />
                <FormField
                  type='number'
                  label='Вес брутто'
                  name='gross_weight'
                  addonAfter={isEditPage && 'кг'}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                />
                <FormField
                  type='number'
                  label='Количество товара'
                  name='count'
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                />
              </div>
              <FormField
                type='textarea'
                label='Примечание'
                name='note'
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
          dataSource={places}
          rowKey={({ id }) => id}
          onRow={(record) => ({
            onClick: (e) => {
              if (e.detail === 2) {
                setNextPage(1)
                setEditProduct(record)
              }
            },
          })}
          style={{ overflow: 'scroll' }}
          rowSelection={{
            type: Checkbox,
          }}
        />
      </div>
      <FilterModal
        isModalOpen={filterModalOpen}
        handleOk={() => setFilterModalOpen(false)}
        handleCancel={() => setFilterModalOpen(false)}
        columns={columns.filter((item) => item.title != '')}
      />
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
      />}
    </>
  )
}

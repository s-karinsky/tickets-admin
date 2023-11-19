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
  DatePicker,
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { BsTrash } from 'react-icons/bs'
import { BiInfoCircle, BiEdit } from 'react-icons/bi'
import { useState } from 'react'
import { SaveOutlined, CopyOutlined } from '@ant-design/icons'
import { InfoModal } from '../../components/InfoModal'
import { FilterModal } from '../../components/FilterModal'
import { Property } from '../../components/Property'
import { PropertyGap } from '../Sendings'
import CreatePlaceModal from '../Sending/CreatePlaceModal'
import CreateProductModal from './СreateProductModal'
import { getSendingById, getPlaceById } from '../../utils/api'
import { SENDING_STATUS } from '../../consts'

const { Title, Link } = Typography

export default function Sending({
  id = 1,
  place = {
    code: ['1', 'Номер'],
    status: ['Выдача со склада', 'Статус / услуга'],
    place: ['2', 'Место'],
    client: ['Александр', 'Клиент'],
    rate: ['12', 'Тариф'],
    count: [23, 'Количество товара'],
    netWeight: [250, 'Вес нетто'],
    grossWeight: [288, 'Вес брутто'],
    size: ['220см', 'Размер'],
    typePay: ['Наличные', 'Тип оплаты'],
    price: ['200$', 'Цена за 1 кг'],
    sum: ['5000 $', 'Сумма оплаты'],
    sumProduct: ['1000 $', 'Сумма товара'],
    note: [
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s..",
      'Примечание',
    ],
  },
  product = {
    code: ['1', 'Номер'],
    name: ['Black&white', 'Наименование'],
    brand: ['Chanel', 'Марка'],
    article: [1, 'Артикул'],
    color: ['Синий', 'Цвет'],
    size: ['XL', 'Размер'],
    price: ['200$', 'Цена за 1 кг'],
    netWeight: [250, 'Вес нетто'],
    grossWeight: [288, 'Вес брутто'],
    sum: ['5000 $', 'Сумма'],
    sertificate: [
      '123 от 12.12.12 до 12.04.21',
      'Сертификат/Декларация о соответствии',
    ],
    note: [
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s..",
      'Примечание',
    ],
  },
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const [ searchParams, setSearchParams ] = useSearchParams()
  const { sendingId, placeId } = useParams()

  const [ sendingData, placeData ] = useQueries( [
    {
      queryKey: ['sending', sendingId],
      queryFn: getSendingById(sendingId)
    },
    {
      queryKey: ['place', placeId],
      queryFn: getPlaceById(placeId)
    }
  ])

  const isNew = placeId === 'create'
  const isEditPage = isNew || searchParams.get('edit') !== null
  
  let places = [
    {
      code: 1,
      count: 2,
      name: 'Black&White',
      brand: 'Channel',
      article: '001',
      color: 'blue',
      size: 'XL',
      weight: 20,
      sum: 20,
      price: 10,
    },
    {
      code: 2,
      count: 2,
      name: 'Black&White',
      brand: 'Channel',
      article: '001',
      color: 'blue',
      size: 'XL',
      weight: 20,
      sum: 20,
      price: 10,
    },
    {
      code: 3,
      count: 2,
      name: 'Black&White',
      brand: 'Channel',
      article: '001',
      color: 'blue',
      size: 'XL',
      weight: 20,
      sum: 20,
      price: 10,
    },
    {
      code: 5,
      count: 2,
      name: 'Black&White',
      brand: 'Channel',
      article: '001',
      color: 'blue',
      size: 'XL',
      weight: 20,
      sum: 20,
      price: 10,
    },
  ]
  places = places.map((item) => {
    return {
      ...item,
      buttons: (
        <div style={{ display: 'flex', gap: 10 }}>
          <BiInfoCircle size={17} color='#141414' />
          {/* <AiOutlineMore size={17} color="#141414" /> */}
          <CopyOutlined size={17} color='#141414' />
          <BsTrash style={{ marginLeft: 30 }} size={17} color='red' />
        </div>
      ),
    }
  })
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [createProduct, setCreateProduct] = useState(false)
  const [createPlace, setCreatePlace] = useState(false)
  const [infoModal, setInfoModal] = useState(false)
  const [nextPage, setNextPage] = useState(0)

  const columns = [
    {
      title: 'Номер',
      sorter: (a, b) => a.code - b.code,
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Марка',
      dataIndex: 'brand',
      key: 'brand',
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
      title: 'Вес нетто',
      dataIndex: 'weight',
      key: 'weight',
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
                  onClick={() => {
                    // editHandle(false)
                  }}
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
                  onClick={() => {}/* editHandle(false) */}
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
                  onClick={() => {
                    // editHandle(true)
                  }}
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
          {isEditPage ? (
            <Form
              style={{ display: 'block', width: '100%' }}
              layout='vertical'
              size='large'
            >
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <Form.Item
                  label='Клиент'
                  name='client'
                >
                  <Select
                    style={{ width: 200 }}
                    options={[
                      { value: 'Александр', title: 'Aktr' },
                      { value: 'Владимир', title: 'Aktr' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label='Место'
                  name='place'
                >
                  <Input
                  />
                </Form.Item>
                <Form.Item
                  label='Статус места'
                  name='status'
                >
                  <Select
                    style={{ width: 200 }}
                    optionFilterProp='children'
                    options={SENDING_STATUS.map((name, i) => ({ label: name, value: i }))}
                    disabled
                  />
                </Form.Item>
                <Form.Item
                  label='Статус услуги'
                  name='service_status'
                >
                  <Select
                    style={{ width: 200 }}
                    optionFilterProp='children'
                    options={[
                      { value: 'В обработке', title: '' },
                      { value: 'Выдано', title: '' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label='Услуги'
                  name='services'
                >
                  <Select
                    style={{ width: 200 }}
                    optionFilterProp='children'
                    options={[
                      { value: 'В обработке', title: '' },
                      { value: 'Выдача со склада', title: '' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label='Тариф'
                  name='tarif'
                >
                  <Select
                    style={{ width: 200 }}
                    optionFilterProp='children'
                    options={[
                      { value: 'Экспресс', title: '' },
                      { value: 'Эконом', title: '' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label='Тип оплаты'
                  name='pay_type'
                >
                  <Select
                    style={{ width: 200 }}
                    optionFilterProp='children'
                    options={[
                      { value: 'Наличный', title: '' },
                      { value: 'Безналичный', title: '' },
                    ]}
                  />
                </Form.Item>
                {/* <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      paddingLeft: 10,
                      color: '#757575',
                    }}
                  >
                    Дата отправки
                  </div>
                  <DatePicker size='large' />
                </div> */}
                <Form.Item
                  label='Цена за 1 кг'
                  name='pay_kg'
                >
                  <Input
                    addonAfter='$'
                    style={{ maxWidth: '250px' }}
                  />
                </Form.Item>
                <Form.Item
                  label='Сумма товара'
                  name='items_sum'
                >
                  <Input
                    addonAfter='$'
                    style={{ maxWidth: '250px' }}
                  />
                </Form.Item>
                <Form.Item
                  label='Сумма оплаты'
                  name='pay_sum'
                >
                  <Input
                    addonAfter='$'
                    style={{ maxWidth: '250px' }}
                  />
                </Form.Item>
                <Form.Item
                  label='Размер'
                  name='size'
                >
                  <Input
                    addonAfter='см'
                    style={{ maxWidth: '250px' }}
                  />
                </Form.Item>
                <Form.Item
                  label='Вес нетто'
                  name='net_weight'
                >
                  <Input
                    addonAfter='кг'
                    style={{ maxWidth: '250px' }}
                    disabled
                  />
                </Form.Item>
                <Form.Item
                  label='Вес брутто'
                  name='gross_weight'
                >
                  <Input
                    addonAfter='кг'
                    style={{ maxWidth: '250px' }}
                  />
                </Form.Item>
                <Form.Item
                  label='Количество товара'
                  name='count'
                >
                  <Input
                    style={{ maxWidth: '250px' }}
                    disabled
                  />
                </Form.Item>
              </div>
              <Form.Item
                label='Примечание'
                name='note'
              >
                <TextArea rows={4} />
              </Form.Item>
            </Form>
          ) : (
            Object.values(place).map((item) => (
              <Property title={item[1]} subtitle={item[0]} />
            ))
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
              onClick={() => setCreateProduct(true)}
              size={'large'}
            >
              Создать
            </Button>
          </div>
        </Row>
        <Table
          size='small'
          columns={columns}
          dataSource={places}
          rowKey={({ id }) => id}
          onRow={(record) => ({
            onClick: (e) => {
              if (e.detail === 2) {
                setNextPage(1)
                setInfoModal(true)
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
      <CreatePlaceModal
        title={`Место 1`}
        isModalOpen={createPlace}
        handleCancel={() => setCreatePlace(false)}
      />
      <InfoModal
        content={product}
        title={`Товар 1`}
        isModalOpen={infoModal}
        footer={[
          <div className=''>
            <Button
              key='1'
              type='primary'
              style={{ backgroundColor: '#1677ff' }}
              onClick={() => {
                setInfoModal(false)
                setCreateProduct(true)
              }}
            >
              Редактировать
            </Button>
            <Button
              key='1'
              type='primary'
              style={{ backgroundColor: 'rgb(0, 150, 80)' }}
              onClick={() => {
                setInfoModal(false)
              }}
            >
              Ок
            </Button>
          </div>,
        ]}
        handleCancel={() => setInfoModal(false)}
      />
      <CreateProductModal
        title={`Создать товар`}
        isModalOpen={createProduct}
        handleCancel={() => setCreateProduct(false)}
      />
    </>
  )
}

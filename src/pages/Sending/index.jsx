import { useState, useCallback } from 'react'
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import {
  Button,
  Row,
  Table,
  Typography,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Checkbox,
  Form,
} from 'antd'
import TextArea from 'antd/es/input/TextArea'
import {
  SaveOutlined,
  CopyOutlined,
  PlusCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { get as _get } from 'lodash'
import { useQuery } from 'react-query'
import { BsTrash } from 'react-icons/bs'
import { BiInfoCircle, BiEdit } from 'react-icons/bi'
import { DateTableCell } from '../../components/DateTableCell'
import { FilterModal } from '../../components/FilterModal'
import { Property } from '../../components/Property'
import { PropertyGap } from '../Sendings'
import CreateSendingModal from '../Sendings/CreateSendingModal'
import CreatePlaceModal from './CreatePlaceModal'
import axios from '../../utils/axios'
import { getSendingById, deleteSendingById } from '../../utils/api'
import { SENDING_STATUS } from '../../consts'

const { Title, Link } = Typography

const propLabels = {
  from: 'Номер',
  create_datetime: 'Дата',
  start_datetime: 'Дата отправки',
  complete_datetime: 'Дата поступления',
  'json.transporter': 'Перевозчик',
  'json.status': 'Статус',
  'json.count_places': 'Количество мест',
  'json.gross_weight': 'Вес брутто',
  'json.net_weight': 'Вес нетто',
  'json.note': 'Примечание'
}

export default function Sending({
  id = 1,
  props = {
    number: [1, 'Номер'],
    date: [new Date().toLocaleDateString(), 'Дата'],
    dateDispatch: [new Date().toLocaleDateString(), 'Дата отправки'],
    dateReceipt: [new Date().toLocaleDateString(), 'Дата поступления'],
    trasporter: ['Александр А. А.', 'Перевозчик'],
    status: ['В обработке', 'Статус'],
    countPlaces: [12, 'Количество мест'],
    grossWeight: [288, 'Вес брутто'],
    netWeight: [250, 'Вес нетто'],
    note: [
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s..",
      'Примечание',
    ],
  },
}) {
  const [ form ] = Form.useForm()
  const [ searchParams, setSearchParams ] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { sendingId } = useParams()

  const { isLoading, data, refetch } = useQuery(['sending', sendingId], getSendingById(sendingId))

  const isNew = sendingId === 'create'
  const isEditPage = isNew || searchParams.get('edit') !== null

  //let places = useSelector(getPlacesList)
  let places = [
    {
      code: 1,
      date: <DateTableCell date={new Date()} />,
      weight: 200,
      client: 'Александ В.',
      status: 'Не назначено',
      count: 10,
      place: 12,
      rate: 1,
    },
    {
      code: 2,
      date: <DateTableCell date={new Date()} />,
      weight: 1200,
      client: 'рлександ В.',
      status: 'Выдача со склада → Выдано',
      count: 23,
      place: 12,
      rate: 0,
    },
    {
      code: 3,
      date: <DateTableCell date={new Date()} />,
      weight: 20,
      client: 'рлександ В.',
      status: 'Выдача со склада → Выдано',
      count: 12,
      place: 12,
      rate: 1,
    },
    {
      code: 5,
      date: <DateTableCell date={new Date()} />,
      weight: 500,
      client: 'рлександ В.',
      status: 'Не назначено',
      count: 2,
      place: 12,
      rate: 12,
    },
  ]

  places = places.map((item) => {
    return {
      ...item,
      buttons: (
        <div style={{ display: 'flex', gap: 10 }}>
          <BiInfoCircle size={17} color='#141414' />
          <CopyOutlined size={17} color='#141414' />
          <PlusCircleOutlined
            size={17}
            style={{ color: '#009650' }}
          />
          <CloseCircleOutlined size={17} style={{ color: 'red' }} />
          <BsTrash style={{ marginLeft: 30 }} size={17} color='red' />
        </div>
      ),
    }
  })
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [createPlace, setCreatePlace] = useState(false)
  const [nextPage, setNextPage] = useState(0)

  const columns = [
    {
      title: 'Номер',

      sorter: (a, b) => a.code - b.code,
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Клиент',
      dataIndex: 'client',
      key: 'client',
    },
    {
      title: 'Место',
      dataIndex: 'place',
      key: 'place',
    },
    {
      title: 'Вес брутто',
      sorter: (a, b) => a.weight - b.weight,
      dataIndex: 'weight',
      key: 'weight',
    },

    {
      title: 'Тариф',
      dataIndex: 'rate',
      key: 'rate',
    },
    {
      title: 'Количество товара',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: 'Услуга / Статус',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '',
      dataIndex: 'buttons',
      key: 'buttons',
    },
  ]

  const sendingTitle = `Отправка ${location.pathname.toString().split('/').slice(-1).join('/')}`

  const handleSubmit = useCallback(async (values) => {
    const keys = ['`id_trip`', '`from`', '`start_datetime`', '`complete_datetime`', '`create_datetime`', '`json`']
    const strValues = [
      'NULL',
      `'${values.from}'`,
      `'${dayjs(values.start_datetime).format('YYYY-MM-DD')}'`,
      `'${dayjs(values.complete_datetime).format('YYYY-MM-DD')}'`,
      `'${dayjs(values.create_datetime).format('YYYY-MM-DD')}'`,
      `'${JSON.stringify(values.json)}'`
    ]
    let sql
    if (sendingId === 'create') {
      sql = `INSERT INTO trip (${keys.join(',')}) VALUES (${strValues.join(',')})`
      await axios.postWithAuth('/query/insert/', { sql })
      navigate('/sendings')
    } else {
      const update = keys.slice(1).map((key, i) => `${key} = ${strValues[i + 1]}`).join(', ')
      sql = `UPDATE trip SET ${update} WHERE id_trip=${sendingId}`
      await axios.postWithAuth('/query/update/', { sql })
      await refetch()
      setSearchParams({})
    }
  }, [sendingId])

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
              {isNew ? 'Новая отправка' : sendingTitle}
            </Title>
            <Link
              onClick={() => navigate(`/sendings`)}
              style={{ color: 'blue' }}
            >
              Отправка товаров <span> </span>
            </Link>
            &gt; 
            {isNew ? ' Создать отправку' : sendingTitle}
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
            {' '}
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
                    form.submit()
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
                  onClick={() => isNew ? navigate('/sendings') : setSearchParams({})}
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
                    navigate('?edit')
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
                  onClick={() => {
                    if (!window.confirm('Delete sending?')) return
                    deleteSendingById(sendingId)().then(() => navigate('/sendings'))
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
          {isEditPage && !isLoading ? (
            <Form
              style={{ display: 'block', width: '100%' }}
              layout='vertical'
              size='large'
              form={form}
              initialValues={data}
              onFinish={handleSubmit}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <Form.Item
                  label='Номер'
                  name='from'
                >
                  <Input
                    style={{ width: 60 }}
                  />
                </Form.Item>
                <Form.Item
                  label='Дата'
                  name='create_datetime'
                >
                  <DatePicker
                    style={{ width: 150 }}
                    defaultValue={dayjs()}
                    format='DD.MM.YYYY'
                  />
                </Form.Item>
                <Form.Item
                  label='Дата отправки'
                  name='start_datetime'
                >
                  <DatePicker
                    style={{ width: 150 }}
                    placeholder='Выберите дату'
                    format='DD.MM.YYYY'
                  />
                </Form.Item>
                <Form.Item
                  label='Дата поступления'
                  name='complete_datetime'
                >
                  <DatePicker
                    style={{ width: 150 }}
                    placeholder='Выберите дату'
                    format='DD.MM.YYYY'
                  />
                </Form.Item>
                <Form.Item
                  label='Количество мест'
                  name={['json', 'count_places']}
                >
                  <InputNumber
                    style={{ width: 120 }}
                  />
                </Form.Item>
                <Form.Item
                  label='Вес нетто'
                  name={['json', 'net_weight']}
                >
                  <InputNumber
                    style={{ width: 120 }}
                    addonAfter='кг'
                  />
                </Form.Item>
                <Form.Item
                  label='Вес брутто'
                  name={['json', 'gross_weight']}
                >
                  <InputNumber
                    style={{ width: 120 }}
                    addonAfter='кг'
                  />
                </Form.Item>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <Form.Item
                  label='Перевозчик'
                  name={['json', 'transporter']}
                >
                  <Select
                    style={{ width: '400px' }}
                    options={[
                      { value: 'Александр', title: 'Aktr' },
                      { value: 'Владимир', title: 'Aktr' },
                    ]}
                  />
                </Form.Item>
                <Form.Item
                  label='Статус'
                  name={['json', 'status']}
                >
                  <Select
                    style={{ width: '200px' }}
                    options={[
                      { value: 0, label: 'Формирование' },
                      { value: 1, label: 'В пути' },
                      { value: 2, label: 'Поступила' },
                      { value: 3, label: 'Приостановлена' },
                    ]}
                  />
                </Form.Item>
              </div>
              <Form.Item
                label='Примечание'
                name={['json', 'note']}
              >
                <TextArea rows={4} />
              </Form.Item>
            </Form>
          ) : (
            Object.keys(propLabels).map(key => {
              const label = propLabels[key]
              const val = _get(data, key)
              let show = val instanceof dayjs ? val.format('DD.MM.YYYY') : val
              if (key === 'json.status') show = SENDING_STATUS[show]
              return <Property title={label} subtitle={show} />
            })
          )}
        </Row>
        <Row>
          <Title
            level={1}
            style={{ fontWeight: '700', marginBottom: '0' }}
          >
            Места
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
                style={{ maxWidth: '200px' }}
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
            <Row
              style={{
                display: 'flex',
                gap: '15px',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                width: '100%',
              }}
            >
              {' '}
              <Button
                type='primary'
                onClick={() => {
                  // editHandle(true)
                  navigate(location.pathname + `/new`)
                }}
                size={'large'}
              >
                Создать
              </Button>
              <Button
                type='primary'
                style={{ backgroundColor: '#009650' }}
                size={'large'}
              >
                Создать счет
              </Button>
              {/* <Button type="primary" size={"large"}>
                                Создать услугу
                            </Button>
                            <Button
                                type="primary"
                                style={{ backgroundColor: "red" }}
                                size={"large"}
                            >
                                Отменить услугу
                            </Button> */}
            </Row>
          </div>
        </Row>
        <Table
          columns={columns}
          dataSource={places}
          rowKey={({ id }) => id}
          onRow={(record) => ({
            onClick: (e) => {
              if (e.detail === 2) {
                navigate(`${location.pathname}/${record.code}`)
              }
            },
          })}
          size='small'
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
        title={`Создать место`}
        isModalOpen={createPlace}
        handleCancel={() => setCreatePlace(false)}
      />
      <CreateSendingModal
        title={`Отправление ${nextPage}`}
        isModalOpen={infoModalOpen}
        handleCancel={() => setInfoModalOpen(false)}
      />
    </>
  )
}

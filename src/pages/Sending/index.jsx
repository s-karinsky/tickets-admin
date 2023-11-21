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
import { useQueries } from 'react-query'
import { BsTrash } from 'react-icons/bs'
import { BiInfoCircle, BiEdit } from 'react-icons/bi'
import { FilterModal } from '../../components/FilterModal'
import { PropertyGap } from '../Sendings'
import CreateSendingModal from '../Sendings/CreateSendingModal'
import CreatePlaceModal from './CreatePlaceModal'
import axios from '../../utils/axios'
import { getSendingById, deleteSendingById, getPlacesBySendingId, deletePlaceById } from '../../utils/api'
import { SENDING_STATUS } from '../../consts'

const { Title, Link } = Typography

export default function Sending({
  isSendingAir
}) {
  const [ form ] = Form.useForm()
  const [ searchParams, setSearchParams ] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { sendingId } = useParams()

  const [ { isLoading, data, refetch }, places ] = useQueries([
    {
      queryKey: ['sending', sendingId],
      queryFn: getSendingById(sendingId)
    },
    {
      queryKey: ['places', sendingId],
      queryFn: getPlacesBySendingId(sendingId)
    }
  ])

  const isNew = sendingId === 'create'
  const isEditPage = isNew || searchParams.get('edit') !== null

  const placesData = (places.data || []).map((item) => {
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
          <BsTrash
            style={{ marginLeft: 30, cursor: 'pointer' }} 
            size={17}
            color='red'
            onClick={() => {
              if (!window.confirm('Delete place?')) return
              deletePlaceById(item.id)().then(() => {
                places.refetch()
              })
            }}
          />
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
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.id - b.id,
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
      dataIndex: 'gross_weight',
      key: 'gross_weight',
      sorter: (a, b) => a.gross_weight - b.gross_weight,
    },
    {
      title: 'Тариф',
      dataIndex: 'tarif',
      key: 'tarif',
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
    const keys = ['`id_trip`', '`from`', '`to`', '`start_datetime`', '`complete_datetime`', '`create_datetime`', '`json`']
    const strValues = [
      'NULL',
      `'${values.from}'`,
      `'${Number(isSendingAir)}'`,
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
  }, [sendingId, isSendingAir])

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
          {!isLoading && (
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
                    bordered={isEditPage}
                    readOnly={!isEditPage}
                  />
                </Form.Item>
                <Form.Item
                  label='Дата'
                  name='create_datetime'
                >
                  {isEditPage ?
                    <DatePicker
                      style={{ width: 150 }}
                      format='DD.MM.YYYY'
                    /> :
                    <div style={{ fontSize: 16, width: 150 }}>
                      {data.create_datetime?.format('DD.MM.YYYY')}
                    </div>
                  }
                </Form.Item>
                <Form.Item
                  label='Дата отправки'
                  name='start_datetime'
                >
                  {isEditPage ?
                    <DatePicker
                      style={{ width: 150 }}
                      format='DD.MM.YYYY'
                    /> :
                    <div style={{ fontSize: 16, width: 150 }}>
                      {data.start_datetime?.format('DD.MM.YYYY')}
                    </div>
                  }
                </Form.Item>
                <Form.Item
                  label='Дата поступления'
                  name='complete_datetime'
                >
                  {isEditPage ?
                    <DatePicker
                      style={{ width: 150 }}
                      format='DD.MM.YYYY'
                    /> :
                    <div style={{ fontSize: 16, width: 150 }}>
                      {data.complete_datetime?.format('DD.MM.YYYY')}
                    </div>
                  }
                </Form.Item>
                <Form.Item
                  label='Количество мест'
                  name={['json', 'count_places']}
                >
                  <InputNumber
                    style={{ width: 120 }}
                    bordered={isEditPage}
                    readOnly={!isEditPage}
                  />
                </Form.Item>
                <Form.Item
                  label='Вес нетто'
                  name={['json', 'net_weight']}
                >
                  <InputNumber
                    style={{ width: 120 }}
                    addonAfter={isEditPage && 'кг'}
                    bordered={isEditPage}
                    readOnly={!isEditPage}
                  />
                </Form.Item>
                <Form.Item
                  label='Вес брутто'
                  name={['json', 'gross_weight']}
                >
                  <InputNumber
                    style={{ width: 120 }}
                    addonAfter={isEditPage && 'кг'}
                    bordered={isEditPage}
                    readOnly={!isEditPage}
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
                  {isEditPage ?
                    <Select
                      style={{ width: '400px' }}
                      options={[
                        { value: 'Александр', title: 'Aktr' },
                        { value: 'Владимир', title: 'Aktr' },
                      ]}
                    /> :
                    <div style={{ fontSize: 16, width: 400 }}>
                      {data.json?.transporter}
                    </div>
                  }
                </Form.Item>
                <Form.Item
                  label='Статус'
                  name={['json', 'status']}
                >
                  {isEditPage ?
                    <Select
                      style={{ width: '200px' }}
                      options={[
                        { value: 0, label: 'Формирование' },
                        { value: 1, label: 'В пути' },
                        { value: 2, label: 'Поступила' },
                        { value: 3, label: 'Приостановлена' },
                      ]}
                    /> :
                    <div style={{ fontSize: 16, width: 150 }}>
                      {SENDING_STATUS[data.json?.status]}
                    </div>
                  }
                </Form.Item>
              </div>
              <Form.Item
                label='Примечание'
                name={['json', 'note']}
              >
                {isEditPage ?
                  <TextArea rows={4} /> :
                  <div style={{ fontSize: 16 }}>
                    {data.json?.note}
                  </div>
                }
              </Form.Item>
            </Form>
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
                  navigate(location.pathname + `/create`)
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
          isLoading={places.isLoading}
          dataSource={placesData}
          rowKey={({ id }) => id}
          onRow={(record) => ({
            onClick: (e) => {
              if (e.detail === 2) {
                navigate(`${location.pathname}/${record.id}`)
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

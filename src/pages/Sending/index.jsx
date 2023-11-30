import { useState, useCallback } from 'react'
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import {
  Button,
  Row,
  Table,
  Typography,
  Input,
  Checkbox,
  Form,
} from 'antd'
import {
  SaveOutlined,
  CopyOutlined
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { get as _get } from 'lodash'
import { useQueries } from 'react-query'
import { BsTrash } from 'react-icons/bs'
import { BiEdit } from 'react-icons/bi'
import { PropertyGap } from '../Sendings'
import FormField from '../../components/FormField'
import axios from '../../utils/axios'
import { getSendingById, deleteSendingById, getPlacesBySendingId, deletePlaceById } from '../../utils/api'
import { getColumnSearchProps } from '../../utils/components'
import { required, numberRange } from '../../utils/validationRules'
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
  const [ search, setSearch ] = useState('')
  const [ activeRow, setActiveRow ] = useState()

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

  const placesData = (places.data || [])
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
            <CopyOutlined size={17} color='#141414' />
            {/* <PlusCircleOutlined
              size={17}
              style={{ color: '#009650' }}
            />
            <CloseCircleOutlined size={17} style={{ color: 'red' }} /> */}
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

  const columns = [
    {
      title: 'Номер',
      dataIndex: 'id',
      key: 'id',
      align: 'right',
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Клиент',
      dataIndex: 'client',
      key: 'client',
      ...getColumnSearchProps('client', { options: [{ value: 'Александр' }, { value: 'Владимир' }] })
    },
    {
      title: 'Место',
      dataIndex: 'place',
      key: 'place',
      ...getColumnSearchProps('place', { type: 'number' })
    },
    {
      title: 'Вес брутто',
      dataIndex: 'gross_weight',
      key: 'gross_weight',
      align: 'right',
      sorter: (a, b) => a.gross_weight - b.gross_weight,
      ...getColumnSearchProps('gross_weight', { type: 'number' })
    },
    {
      title: 'Тариф',
      dataIndex: 'tarif',
      key: 'tarif',
      ...getColumnSearchProps('tarif', { options: [{ value: 'Эконом' }, { value: 'Экспресс' }] })
    },
    {
      title: 'Количество товара',
      dataIndex: 'count',
      key: 'count',
      align: 'right',
      ...getColumnSearchProps('count', { type: 'number' })
    },
    {
      title: 'Услуга / Статус',
      dataIndex: 'status',
      key: 'status',
      render: val => val === 0 ? 'В обработке' : 'Выдано',
      ...getColumnSearchProps(record => record.status + 1, { options: [{ value: 1, label: 'В обработке' }, { value: 2, label: 'Выдано' }] })
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
              <FormField
                label='Номер'
                name='from'
                type='number'
                style={{ width: 120 }}
                isEdit={isEditPage}
                rules={
                  [
                    ...required(),
                    () => ({
                      validator(_, id) {
                        if (!isNew && id === parseInt(data.from)) return Promise.resolve()
                        return axios.postWithAuth('/query/select', { sql: `SELECT * FROM trip WHERE \`from\`=${id} AND canceled=0`})
                          .then(res => {
                            const resData = res.data?.data || []
                            return resData.length > 0 ? Promise.reject(new Error('Отправка с таким номером уже существует')) : Promise.resolve()
                          })
                      },
                    })
                  ]
                }
              />
              <FormField
                type='date'
                label='Дата'
                name='create_datetime'
                style={{ width: 150 }}
                isEdit={isEditPage}
                text={data.create_datetime?.format('DD.MM.YYYY')}
                rules={required()}
              />
              <FormField
                type='date'
                label='Дата отправки'
                name='start_datetime'
                style={{ width: 150 }}
                isEdit={isEditPage}
                text={data.start_datetime?.format('DD.MM.YYYY')}
              />
              <FormField
                type='select'
                label='Перевозчик'
                name={['json', 'transporter']}
                style={{ width: 200 }}
                isEdit={isEditPage}
                options={[
                  { value: 'Александр', title: 'Aktr' },
                  { value: 'Владимир', title: 'Aktr' },
                ]}
                text={data.json?.transporter}
                rules={required()}
              />
              <FormField
                type='date'
                label='Дата поступления'
                name='complete_datetime'
                style={{ width: 150 }}
                isEdit={isEditPage}
                text={data.complete_datetime?.format('DD.MM.YYYY')}
              />
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <FormField
                  type='number'
                  label='Количество'
                  name={['json', 'count_places']}
                  style={{ width: 120 }}
                  isEdit={isEditPage}
                  text={data.complete_datetime?.format('DD.MM.YYYY')}
                  rules={[...required(), ...numberRange({ min: 1, max: 99999 })]}
                />
                <FormField
                  type='number'
                  label={<><sup>∑</sup>&nbsp;Вес нетто</>}
                  name={['json', 'net_weight']}
                  style={{ width: 120 }}
                  isEdit={isEditPage}
                  addonAfter={isEditPage && 'кг'}
                  rules={numberRange({ min: 1, max: 99999 })}
                  formatter={(val) => Number(val).toFixed(3)}
                />
                <FormField
                  type='number'
                  label={<><sup>∑</sup>&nbsp;Вес брутто</>}
                  name={['json', 'gross_weight']}
                  style={{ width: 120 }}
                  isEdit={isEditPage}
                  addonAfter={isEditPage && 'кг'}
                  rules={numberRange({ min: 1, max: 99999 })}
                  formatter={(val) => Number(val).toFixed(3)}
                />
                <FormField
                  type='select'
                  label={<><sup>ƒ</sup>&nbsp;Статус</>}
                  name={['json', 'status']}
                  style={{ width: 200 }}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                  options={SENDING_STATUS.map((label, value) => ({ label, value }))}
                  text={SENDING_STATUS[data.json?.status]}
                />
              </div>
            </div>
            <FormField
              type='textarea'
              label='Примечание'
              name={['json', 'note']}
              isEdit={isEditPage}
              text={data.json?.note}
              rows={4}
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
                  style={{ width: 300 }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
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
                  size='large'
                  title='Функция в разработке'
                  disabled
                >
                  Создать услугу
                </Button>
                <Button
                  type='primary'
                  size='large'
                  title='Функция в разработке'
                  disabled
                >
                    Отменить услугу
                </Button>
              </Row>
            </div>
          </Row>
          <Table
            columns={columns}
            isLoading={places.isLoading}
            dataSource={placesData}
            rowClassName={(r, index) => index === activeRow ? 'active-row' : ''}
            rowKey={({ id }) => id}
            onRow={(record, index) => ({
              onClick: (e) => {
                if (e.detail === 2) {
                  navigate(`${location.pathname}/${record.id}`)
                } else {
                  setActiveRow(index)
                }
              },
            })}
            size='small'
            style={{ overflow: 'scroll' }}
          />
        </>
      }
    </div>
  )
}

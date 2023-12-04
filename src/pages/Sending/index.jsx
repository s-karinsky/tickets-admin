import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Button, Row, Table, Typography, Input, Form, Modal } from 'antd'
import {
  SaveOutlined,
  CopyOutlined,
  ExclamationCircleFilled
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useQueries } from 'react-query'
import { BsTrash } from 'react-icons/bs'
import { BiEdit } from 'react-icons/bi'
import { PropertyGap } from '../Sendings'
import FormField from '../../components/FormField'
import { useUsers, getCount, createSending, updateSendingById, getSendingById, deleteSendingById, getPlacesBySendingId, deletePlaceById, useDictionary } from '../../utils/api'
import { getColumnSearchProps } from '../../utils/components'
import { required } from '../../utils/validationRules'
import { declOfNum, filterTableRows } from '../../utils/utils'
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
  
  const isNew = sendingId === 'create'
  const isEditPage = isNew || searchParams.get('edit') !== null

  const clients = useUsers(1)
  const drivers = useUsers(2)

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

  const isNotSending = data?.json?.status === 0

  const clientsMap = useMemo(() => {
    if (!Array.isArray(clients.data)) return {}
    return clients.data.reduce((acc, item) => ({ ...acc, [item.id_user]: [item.family, item.name, item.middle].join(' ') }), {})
  }, [clients.data])

  const [ driverOptions, driverMap ] = useMemo(() => {
    if (!Array.isArray(drivers.data)) return [[], {}]
    const options = drivers.data.map(item => ({
      value: item.id_user,
      label: [item.family, item.name, item.middle].join(' ')
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [drivers.data])

  const placesData = (places.data || [])
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
              onClick={async () => {
                const count = await getCount('dataset', `ref_tip='place' AND id_ref=${item.id}`)
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
                  onOk: () => deletePlaceById(item.id).then(() => places.refetch())
                })
              }}
            />
          </div>
        ),
      }
    })

  const columns = [
    {
      title: 'Место',
      dataIndex: 'place',
      key: 'place',
      align: 'right',
      ...getColumnSearchProps('place', { type: 'number' })
    },
    {
      title: 'Клиент',
      dataIndex: 'client',
      key: 'client',
      render: id => clientsMap[id],
      ...getColumnSearchProps('client', { options: [{ value: 'Александр' }, { value: 'Владимир' }] })
    },
    {
      title: 'Вес брутто',
      dataIndex: 'gross_weight',
      key: 'gross_weight',
      align: 'right',
      render: val => Number(val).toFixed(3),
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
      title: 'Статус услуги',
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
  const sendingTitle = `Отправка №${data?.from}`

  const handleSubmit = useCallback(async (values) => {
    const valuesMap = {
      from: values.from,
      to: Number(isSendingAir),
      create_datetime: dayjs(values.create_datetime).format('YYYY-MM-DD'),
      json: JSON.stringify(values.json)
    }
    if (sendingId === 'create') {
      await createSending(valuesMap)
      navigate('/sendings')
    } else {
      await updateSendingById(sendingId, valuesMap)
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
                size='large'
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
            isNotSending && <>
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
                width={120}
                label='Номер'
                name='from'
                type='number'
                isEdit={isEditPage}
                rules={
                  [
                    ...required(),
                    () => ({
                      validator: async (_, id) => {
                        if (!isNew && parseInt(id) === parseInt(data.from)) return Promise.resolve()
                        const count = await getCount('trip', `\`from\`=${id} AND canceled=0 AND YEAR(create_datetime) = YEAR('${dayjs().format('YYYY-MM-DD')}')`)
                        return count > 0 ? Promise.reject(new Error('Отправка с таким номером уже существует')) : Promise.resolve()
                      },
                    })
                  ]
                }
              />
              <FormField
                width={200}
                type='date'
                label='Дата'
                name='create_datetime'
                isEdit={isEditPage}
                text={data.create_datetime?.format('DD.MM.YYYY')}
                rules={required()}
              />
              <FormField
                width={600}
                type='select'
                label='Перевозчик'
                name={['json', 'transporter']}
                isEdit={isEditPage}
                options={driverOptions}
                text={driverMap[data.json?.transporter]}
                rules={required()}
              />
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  flexWrap: 'wrap',
                }}
              >
                <FormField
                  type='date'
                  label='Дата отправки'
                  labelType='calc'
                  name='start_datetime'
                  style={{ width: 150 }}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                  text={data.start_datetime && data.start_datetime?.format('DD.MM.YYYY')}
                />
                <FormField
                  type='date'
                  label='Дата поступления'
                  labelType='calc'
                  name='complete_datetime'
                  style={{ width: 150 }}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                  text={data.complete_datetime && data.complete_datetime?.format('DD.MM.YYYY')}
                />
                <FormField
                  type='number'
                  label='Количество'
                  labelType='sum'
                  name='count'
                  style={{ width: 120 }}
                  isEdit={isEditPage}
                  disabled={isEditPage}
                  formatter={val => val === '' ? '0' : val}
                />
                <FormField
                  type='number'
                  label='Вес нетто'
                  labelType='sum'
                  name='net_weight'
                  style={{ width: 120 }}
                  isEdit={isEditPage}
                  addonAfter={isEditPage && 'кг'}
                  formatter={(val) => Number(val).toFixed(3)}
                  disabled={isEditPage}
                />
                <FormField
                  type='number'
                  label='Вес брутто'
                  labelType='sum'
                  name='gross_weight'
                  style={{ width: 120 }}
                  isEdit={isEditPage}
                  addonAfter={isEditPage && 'кг'}
                  formatter={(val) => Number(val).toFixed(3)}
                  disabled={isEditPage}
                />
                <FormField
                  type='select'
                  label='Статус'
                  labelType='calc'
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
              width={960}
              type='textarea'
              label='Примечание'
              name={['json', 'note']}
              isEdit={isEditPage}
              text={data.json?.note}
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
                {isNotSending && <Button
                  type='primary'
                  onClick={() => {
                    // editHandle(true)
                    navigate(location.pathname + `/create`)
                  }}
                  size={'large'}
                >
                  Создать
                </Button>}
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

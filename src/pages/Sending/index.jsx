import { useState, useCallback, useMemo } from 'react'
import { useNavigate, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { Button, Row, Table, Typography, Input, Form, Modal, Checkbox } from 'antd'
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
import { useDictionary, useUsersWithRole, getLastId, getCount, createSending, updateSendingById, getSendingById, deleteSendingById, getPlacesBySendingId, deletePlaceById } from '../../utils/api'
import { getColumnSearchProps } from '../../utils/components'
import { required } from '../../utils/validationRules'
import { declOfNum, numberFormatter, getPaginationSettings, filterOption } from '../../utils/utils'
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
  const [ activeRow, setActiveRow ] = useState()
  
  const isNew = sendingId === 'create'
  const isEditPage = isNew || searchParams.get('edit') !== null

  const clients = useUsersWithRole(1)
  const drivers = useUsersWithRole(2)

  const [ { isLoading, data, refetch }, places ] = useQueries([
    {
      queryKey: ['sending', sendingId],
      queryFn: getSendingById(sendingId),
      cacheTime: 0
    },
    {
      queryKey: ['places', sendingId],
      queryFn: getPlacesBySendingId(sendingId)
    }
  ])
  const tarifs = useDictionary('tarif')

  const isNotSending = data?.json?.status === 0

  const [ clientsOptions, clientsMap ] = useMemo(() => {
    if (!Array.isArray(clients.data)) return [[], {}]
    const options = clients.data.map(item => ({
      value: item.id_user,
      label: item.json?.code
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [clients.data])

  const [ driverOptions, driverMap ] = useMemo(() => {
    if (!Array.isArray(drivers.data)) return [[], {}]
    const options = drivers.data.map(item => ({
      value: item.id_user,
      label: item.json?.code
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [drivers.data])

  const placesData = (places.data || [])
    .map((item) => {
      return {
        ...item,
        buttons: (
          isNotSending && <div style={{ display: 'flex', gap: 10 }}>
            <CopyOutlined
              size={17}
              color='#141414'
              onClick={() => {
                navigate(`/sendings/${sendingId}/create?copy=${item.id}`)
              }}
            />
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
    },
    {
      title: 'Статус услуги',
      dataIndex: 'status',
      key: 'status',
      render: val => '',
      sorter: (a, b) => a.status - b.status,
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
      const id = await getLastId('trip', 'id_trip')
      navigate(`/sendings/${id}`)
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
                icon={<SaveOutlined />}
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
                icon={<BiEdit />}
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
              </Button>
              <Button
                size='large'
                icon={<BsTrash />}
                style={{
                  gap: 10,
                  display: 'flex',
                  alignItems: 'center',
                }}
                type='primary'
                onClick={() => {
                  const count = placesData.length
                  Modal.confirm({
                    title: 'Вы действительно хотите удалить эту отправку?',
                    icon: <ExclamationCircleFilled />,
                    content: count > 0 && <div>
                      К этой отправке {declOfNum(count, ['привязана', 'привязано', 'привязано'])} {count}&nbsp;
                      {declOfNum(count, ['запись', 'записи', 'записей'])} о местах, {count === '1' ? 'которая' : 'которые'} так же&nbsp;
                      {count === '1' ? 'будет удалена' : 'будут удалены'}
                    </div>,
                    okText: 'Да',
                    okType: 'danger',
                    cancelText: 'Нет',
                    onOk: () => deleteSendingById(sendingId).then(() => navigate('/sendings'))
                  })
                }}
                danger
              >
                Удалить
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
                filterOption={filterOption}
                showSearch
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
                  formatter={numberFormatter(3)}
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
                  formatter={numberFormatter(3)}
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
              <Title
                level={1}
                style={{ fontWeight: '700', marginBottom: '0' }}
              >
                Места
              </Title>
            </Row>
            <Row
              style={{
                display: 'flex',
                gap: '15px',
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
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
            rowSelection={{
              type: Checkbox,
            }}
            pagination={getPaginationSettings('sending')}
          />
        </>
      }
    </div>
  )
}

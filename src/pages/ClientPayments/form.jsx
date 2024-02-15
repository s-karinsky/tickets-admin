import { useState, useMemo, useEffect } from 'react'
import { Row, Col, Typography, Form, Button, Checkbox, Modal, DatePicker } from 'antd'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { LoadingOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { get as _get } from 'lodash'
import dayjs from 'dayjs'
import FormField from '../../components/FormField'
import { useClientPayments, useUsersWithRole, useDictionary } from '../../utils/api'
import axios from '../../utils/axios'
import { sqlInsert, sqlUpdate } from '../../utils/sql'
import { numberRange } from '../../utils/validationRules'
import { VALIDATION_MESSAGES } from '../../consts'
import { getSurnameWithInitials } from '../../utils/utils'

export default function ClientPaymentsForm({ user }) {
  const [ isModal, setIsModal ] = useState()
  const [ doneDate, setDoneDate ] = useState(dayjs())
  const [ isUpdating, setIsUpdating ] = useState(false)
  const [ form ] = Form.useForm()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = id === 'create'
  const { data = {}, isLoading, isRefetching, refetch } = useClientPayments(id, location.state || {}, { staleTime: 0, refetchOnWindowFocus: false })
  const employe = useUsersWithRole(2)
  const clients = useUsersWithRole(1)

  const client = Form.useWatch('client', form)
  const inclient = useDictionary('inclient', { id_ref: client }, { enabled: !!client })

  const payDate = Form.useWatch('payment_date', form)
  useEffect(() => {
    setDoneDate(payDate)
  }, [payDate])

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

  const [ inclientOptions, inclientMap ] = useMemo(() => {
    if (!Array.isArray(inclient.data?.list)) return [[], {}]
    const options = inclient.data.list.map((item) => ({
      value: item.id,
      label: [item.family, item.name, item.middle].filter(Boolean).join(' ')
    }))
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [inclient.data])

  const employeOptions = useMemo(() => {
    if (!employe.data) return []
    return employe.data.map(item => ({
      value: item.id_user,
      label: item.json?.code
    }))
  }, [employe.data])

  const payType = Form.useWatch('pay_type', form)
  const isCash = payType?.toLowerCase() === 'наличный'
  const isGiveClient = Form.useWatch('give_client', form)
  data.get_employe = user.u_id

  return isLoading || isRefetching ?
    <Row style={{ height: 'calc(100vh - 64px)' }} justify='center' align='middle'>
      <LoadingOutlined style={{ fontSize: '64px' }} />
    </Row> :
    <>
      <Form
        validateMessages={VALIDATION_MESSAGES}
        layout='vertical'
        size='large'
        initialValues={data}
        form={form}
        onFinish={async (values) => {
          const { date, ...params } = values
          setIsUpdating(true)
          if (isNew) {
            await axios.postWithAuth('/query/insert', { sql:
              sqlInsert('dataset', {
                status: 0,
                tip: 'cl-payment',
                created_at: date.format('YYYY-MM-DD'),
                pole: JSON.stringify(params)
              })
            })
          } else {
            await axios.postWithAuth('/query/update', { sql:
              sqlUpdate('dataset', {
                created_at: date.format('YYYY-MM-DD'),
                pole: JSON.stringify(params)
              }, `id=${id}`)
            })
          }
          navigate('/client-payments')
        }}
      >
        <Row align='middle' style={{ padding: '0 40px' }}>
          <Col span={12}>
            <Typography.Title style={{ fontWeight: 'bold' }}>{isNew ? 'Новая оплата клиента' : `Оплата клиента`}</Typography.Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
          {!isNew && <Button
              style={{ marginRight: 20 }}
              size='large'
              htmlType='button'
              danger={data.done}
              onClick={() => {
                if (!data.done) {
                  setIsModal(true)
                }
                else {
                  Modal.confirm({
                    title: 'Отменить проведение счета?',
                    icon: <ExclamationCircleFilled />,
                    okText: 'Да',
                    okType: 'danger',
                    cancelText: 'Нет',
                    onOk: async () => {
                      await axios.postWithAuth('/query/update', { sql: sqlUpdate('dataset', { pole: JSON.stringify({ ...data.pole, done: false, done_date: '' }) }, `id=${id}`) })
                      refetch()
                    }
                  })
                }
              }}
            >
              {data.done ? 'Отменить проведение' : 'Провести'}
            </Button>}
            <Button
              style={{ marginRight: 20 }}
              type='primary'
              size='large'
              htmlType='submit'
              loading={isUpdating}
            >
              Сохранить
            </Button>
            <Button
              type='primary'
              size='large'
              htmlType='button'
              onClick={() => navigate('/client-payments')}
              danger
            >
              Отмена
            </Button>
          </Col>
          <Col span={24}>
            <Row gutter={10} align='bottom'>
              <Col span={4}>
                <FormField
                  label='Номер'
                  name='number'
                  type='number'
                  width='100%'
                  rules={[{ required: true }, ...numberRange({ min: 1, max: 99999 })]}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Дата'
                  name='date'
                  type='date'
                  rules={[{ required: true }]}
                  width='100%'
                />
              </Col>
              <Col span={4}>
              <FormField
                  label='Клиент'
                  name='client'
                  type='select'
                  options={clientsOptions}
                  text={clientsMap[data.client]}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Внутренний клиент'
                  name='inclient'
                  type='select'
                  options={inclientOptions}
                  text={inclientMap[data.inclient]}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Номер счета'
                  name='invoice_number'
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Дата счета'
                  name='invoice_date'
                  type='date'
                />
              </Col>
              <Col span={12}>
                <FormField
                  label='Наименование'
                  name='name'
                  rules={[{ required: true }]}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Тип оплаты'
                  name='pay_type'
                  type='select'
                  options={[
                    { value: 'Наличный', title: '' },
                    { value: 'Безналичный', title: '' },
                  ]}
                  rules={[{ required: true }]}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Дата оплаты'
                  name='payment_date'
                  type='date'
                />
              </Col>
              <Col span={4}>
                <Form.Item
                  width='100%'
                  name='give_client'
                  valuePropName='checked'
                  rules={[ { required: isCash } ]}
                >
                  <Checkbox>Передал клиент</Checkbox>
                </Form.Item>
              </Col>
              <Col span={8}>
                <FormField
                  label='Передал оплату ФИО'
                  name='pay_name'
                  rules={[ { required: !isGiveClient } ]}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Получил'
                  name='get_employe'
                  type='select'
                  options={employeOptions}
                  rules={[ { required: isCash } ]}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Курс 1$'
                  name='rate'
                  type='number'
                  width='100%'
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Сумма оплаты ($)'
                  addonAfter='$'
                  name='pay_usd'
                  type='number'
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Сумма оплаты (₽)'
                  addonAfter='₽'
                  name='pay_rub'
                  type='number'
                />
              </Col>
              <Col span={24}>
                <FormField
                  label='Примечание'
                  name='note'
                  type='textarea'
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
      {isModal &&
        <Modal
          title='Выберите дату проведения'
          onOk={async () => {
            await axios.postWithAuth('/query/update', {
              sql: sqlUpdate('dataset', { pole: JSON.stringify({ ...data.pole, done: true, done_date: doneDate.format('YYYY-MM-DD') }) }, `id=${id}`)
            })
            refetch()
            setIsModal(false)
          }}
          onCancel={() => setIsModal(false)}
          okText='Провести'
          open
        >
          <DatePicker
            size='large'
            value={doneDate}
            onChange={val => setDoneDate(val)}
            format='DD.MM.YYYY'
            style={{ width: '100%' }}
          />
        </Modal>
      }
    </>
}
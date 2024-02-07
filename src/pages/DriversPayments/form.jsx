import { useState, useMemo, useEffect } from 'react'
import { Row, Col, Typography, Form, Button, Checkbox, Modal, DatePicker } from 'antd'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { LoadingOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { get as _get } from 'lodash'
import dayjs from 'dayjs'
import FormField from '../../components/FormField'
import { useDriversPayments, useUsersWithRole, useDictionary } from '../../utils/api'
import axios from '../../utils/axios'
import { sqlInsert, sqlUpdate } from '../../utils/sql'
import { numberRange } from '../../utils/validationRules'
import { VALIDATION_MESSAGES } from '../../consts'

export default function DriversPaymentsForm({ user }) {
  const [ isModal, setIsModal ] = useState()
  const [ doneDate, setDoneDate ] = useState(dayjs())
  const [ isUpdating, setIsUpdating ] = useState(false)
  const [ form ] = Form.useForm()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = id === 'create'
  const { data = {}, isLoading, isRefetching, refetch } = useDriversPayments(id, location.state || {}, { staleTime: 0, refetchOnWindowFocus: false })

  const drivers = useDictionary('drivers')
  const [ driversOptions, driversMap ] = useMemo(() => {
    if (!Array.isArray(drivers.data?.list)) return [[], {}]
    const options = drivers.data.list.map(({ pole = {}, ...item }) => ({
      value: item.id,
      label: `${item.value} (${[item.family, item.name, item.middle].filter(Boolean).join(' ')})`
    }))
    return [ options, drivers.data.map ]
  }, [drivers.data])

  const employe = useUsersWithRole(2)
  const employeOptions = useMemo(() => {
    if (!employe.data) return []
    return employe.data.map(item => ({
      value: item.id_user,
      label: item.json?.code
    }))
  }, [employe.data])

  const payDate = Form.useWatch('payment_date', form)
  useEffect(() => {
    setDoneDate(payDate)
  }, [payDate])

  const payType = Form.useWatch('pay_type', form)
  const isCash = payType?.toLowerCase() === 'наличный'

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
                tip: 'dr-payment',
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
          navigate('/drivers-payments')
        }}
      >
        <Row align='middle' style={{ padding: '0 40px' }}>
          <Col span={12}>
            <Typography.Title style={{ fontWeight: 'bold' }}>{isNew ? 'Новая оплата перевозчику' : `Оплата перевозчику`}</Typography.Title>
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
              onClick={() => navigate('/drivers-payments')}
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
                  label='Перевозчик'
                  name='driver'
                  type='select'
                  options={driversOptions}
                  text={driversMap[data.driver]}
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
                  width='100%'
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
              <Col span={12}>
                <FormField
                  label='Наименование'
                  name='name'
                  rules={[{ required: true }]}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Дата оплаты'
                  name='payment_date'
                  type='date'
                  width='100%'
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Передал'
                  name='give_employe'
                  type='select'
                  options={employeOptions}
                  rules={[ { required: isCash } ]}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Получил'
                  name='get_name'
                  rules={[ { required: true } ]}
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
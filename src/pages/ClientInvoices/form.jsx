import { useEffect, useState, useMemo } from 'react'
import { Row, Col, Typography, Form, Button, DatePicker, Modal } from 'antd'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import { LoadingOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { get as _get } from 'lodash'
import FormField from '../../components/FormField'
import { useClientInvoices, useUsersWithRole, useUsers } from '../../utils/api'
import axios from '../../utils/axios'
import { numberRange } from '../../utils/validationRules'
import { VALIDATION_MESSAGES } from '../../consts'
import { sqlInsert, sqlUpdate } from '../../utils/sql'
import { parseJSON, getSurnameWithInitials } from '../../utils/utils'

export default function ClientInvoicesForm() {
  const [ isModal, setIsModal ] = useState()
  const [ doneDate, setDoneDate ] = useState()
  const [ isUpdating, setIsUpdating ] = useState(false)
  const [ form ] = Form.useForm()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = id === 'create'
  const { data = {}, isLoading, isRefetching, refetch } = useClientInvoices(id, location.state || {}, { staleTime: 0, refetchOnWindowFocus: false })
  const clients = useUsersWithRole(1)
  const client = Form.useWatch('client', form)
  const inclient = useUsers(undefined, { id_role: '3', create_user: client }, { enabled: !!client })

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
    if (!Array.isArray(inclient.data)) return [[], {}]
    const options = inclient.data.map(({ json = {}, ...item }) => {
      const fullname = getSurnameWithInitials(item.family, item.name, item.middle)
      return {
        value: item.id_user,
        label: `${json.code}${fullname ? ` (${fullname})` : ''}`
      }
    })
    const map = options.reduce((acc, item) => ({ ...acc, [item.value]: item.label }), {})
    return [ options, map ]
  }, [inclient.data])

  const discountRub = Form.useWatch('discount_rub', form)
  const discountUsd = Form.useWatch('discount_usd', form)
  const payUsd = Form.useWatch('pay_usd', form)
  const rate = Form.useWatch('rate', form)
  const payType = Form.useWatch('pay_type', form)

  useEffect(() => {
    let pay = payUsd
    if (typeof pay === 'string') {
      pay = pay.replaceAll(' ', '').replaceAll(',', '.')
    }
    form.setFieldValue('pay_rub', Math.round(Number(pay) * Number(rate)))
  }, [payUsd, rate])

  const sumUsd = Form.useWatch('sum_usd', form)

  useEffect(() => {
    let pay = sumUsd
    if (typeof pay === 'string') {
      pay = pay.replaceAll(' ', '').replaceAll(',', '.')
    }
    form.setFieldValue('sum_rub', Math.round(Number(pay) * Number(rate)))
  }, [sumUsd, rate])

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
          params.total_usd = params.pay_usd - params.discount_usd
          params.total_rub = Math.round(params.pay_rub - params.discount_rub)
          if (location.state?.id) {
            params.parent_trip = location.state?.id
          }
          if (isNew) {
            const created = await axios.postWithAuth('/query/insert', { sql:
              sqlInsert('dataset', {
                status: 0,
                tip: 'cl-invoice',
                created_at: date.format('YYYY-MM-DD'),
                pole: JSON.stringify(params)
              })
            })
            if (location.state?.type === 'payment') {
              const id = location.state?.id
              const resp = await axios.select('dataset', 'pole', { where: { id }})
              const payment = (resp.data?.data || [])[0]?.pole
              const pole = parseJSON(payment)
              pole.invoice_number = params.number
              await axios.postWithAuth('/query/update', { sql: `UPDATE dataset SET pole='${JSON.stringify(pole)}' WHERE id=${id}` })
            }
          } else {
            await axios.postWithAuth('/query/update', { sql:
              sqlUpdate('dataset', {
                created_at: date.format('YYYY-MM-DD'),
                pole: JSON.stringify(params)
              }, `id=${id}`)
            })
          }
          navigate('/client-invoices')
        }}
      >
        <Row align='middle' style={{ padding: '0 40px' }}>
          <Col span={12}>
            <Typography.Title style={{ fontWeight: 'bold' }}>{isNew ? 'Новый счет на оплату клиента' : `Счет на оплату клиента`}</Typography.Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            {!isNew && <Button
              style={{ marginRight: 20 }}
              size='large'
              htmlType='button'
              danger={data.done}
              onClick={() => {
                if (!data.done) {
                  setDoneDate(dayjs())
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
            {!data.done && <Button
              style={{ marginRight: 20 }}
              type='primary'
              size='large'
              htmlType='submit'
              loading={isUpdating}
            >
              Сохранить
            </Button>}
            <Button
              type='primary'
              size='large'
              htmlType='button'
              onClick={() => navigate('/client-invoices', { state: { refetch: 1 }})}
              danger
            >
              Отмена
            </Button>
          </Col>
          <Col span={24}>
            <Row gutter={10}>
              <Col span={4}>
                <FormField
                  label='Номер'
                  name='number'
                  type='number'
                  width='100%'
                  rules={[{ required: true }, ...numberRange({ min: 1, max: 99999 })]}
                  isEdit={!data.done}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Дата'
                  name='date'
                  type='date'
                  rules={[{ required: true }]}
                  width='100%'
                  isEdit={!data.done}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Клиент'
                  name='client'
                  type='select'
                  options={clientsOptions}
                  text={clientsMap[data.client]}
                  disabled={!!data.client}
                  isEdit={!data.done}
                  showSearch
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Внутренний клиент'
                  name='inclient'
                  type='select'
                  options={inclientOptions}
                  text={inclientMap[data.client]}
                  disabled={!client}
                  isEdit={!data.done}
                  showSearch
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='Наименование'
                  name='name'
                  rules={[{ required: true }]}
                  isEdit={!data.done}
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
                  isEdit={!data.done}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Курс 1$'
                  name='rate'
                  type='number'
                  width='100%'
                  isEdit={!data.done}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Сумма оплаты ($)'
                  addonAfter='$'
                  name='pay_usd'
                  type='number'
                  isEdit={!data.done}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Сумма оплаты (₽)'
                  addonAfter='₽'
                  name='pay_rub'
                  type='number'
                  isEdit={!data.done}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Скидка ($)'
                  addonAfter='$'
                  name='discount_usd'
                  type='number'
                  disabled={!!discountRub}
                  isEdit={!data.done}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Скидка (₽)'
                  addonAfter='₽'
                  name='discount_rub'
                  type='number'
                  disabled={!!discountUsd}
                  isEdit={!data.done}
                />
              </Col>
              <Col span={24}>
                <FormField
                  label='Описание скидки'
                  name='discount_note'
                  rules={[ { required: !!discountUsd || !!discountRub } ]}
                  isEdit={!data.done}
                />
              </Col>
              <Col span={4}>
                <Form.Item dependencies={['pay_usd', 'sum_usd', 'discount_usd']}>
                  {({ getFieldValue }) => {
                    const pay = getFieldValue('pay_usd') || 0
                    const sum = getFieldValue('sum_usd') || 0
                    const discount = getFieldValue('discount_usd') || 0
                    return (
                      <FormField
                        label='К оплате ($)'
                        labelType='calc'
                        addonAfter='$'
                        type='number'
                        value={pay + sum - discount}
                        isEdit={!data.done}
                        disabled
                      />
                    )
                  }}
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item dependencies={['pay_rub', 'sum_rub', 'discount_rub']} shouldUpdate>
                  {({ getFieldValue }) => {
                    const pay = getFieldValue('pay_rub') || 0
                    const sum = getFieldValue('sum_rub') || 0
                    const discount = getFieldValue('discount_rub') || 0
                    return (
                      <FormField
                        label='К оплате (₽)'
                        labelType='calc'
                        addonAfter='₽'
                        type='number'
                        value={Math.round(pay + sum - discount)}
                        isEdit={!data.done}
                        disabled
                      />
                    )
                  }}
                </Form.Item>
              </Col>
              <Col span={4}>
                <FormField
                  label='Сумма товара ($)'
                  addonAfter='$'
                  name='sum_usd'
                  type='number'
                  disabled={payType === 'Наличный'}
                  isEdit={!data.done}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Сумма товара (₽)'
                  addonAfter='₽'
                  name='sum_rub'
                  type='number'
                  disabled={payType === 'Наличный'}
                  isEdit={!data.done}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Баллы'
                  name='scores'
                  type='number'
                  width='100%'
                  isEdit={!data.done}
                />
              </Col>
              <Col span={24}>
                <FormField
                  label='Примечание'
                  name='note'
                  type='textarea'
                  isEdit={!data.done}
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
import { useEffect, useState, useMemo } from 'react'
import { Row, Col, Typography, Form, Button, DatePicker, Modal } from 'antd'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import dayjs from 'dayjs'
import { LoadingOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { get as _get } from 'lodash'
import FormField from '../../components/FormField'
import { useDriversInvoices, useDictionary } from '../../utils/api'
import axios from '../../utils/axios'
import { numberRange } from '../../utils/validationRules'
import { VALIDATION_MESSAGES } from '../../consts'
import { sqlInsert, sqlUpdate } from '../../utils/sql'
import { parseJSON } from '../../utils/utils'

export default function DriversInvoicesForm() {
  const [ isModal, setIsModal ] = useState()
  const [ doneDate, setDoneDate ] = useState(dayjs())
  const [ isUpdating, setIsUpdating ] = useState(false)
  const [ form ] = Form.useForm()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isNew = id === 'create'
  const { data = {}, isLoading, isRefetching, refetch } = useDriversInvoices(id, location.state || {}, { staleTime: 0, refetchOnWindowFocus: false })
  const drivers = useDictionary('drivers')

  const [ driversOptions, driversMap ] = useMemo(() => {
    if (!Array.isArray(drivers.data?.list)) return [[], {}]
    const options = drivers.data.list.map(({ pole = {}, ...item }) => ({
      value: item.id,
      label: `${item.value} (${[item.family, item.name, item.middle].filter(Boolean).join(' ')})`
    }))
    return [ options, drivers.data.map ]
  }, [drivers.data])

  const discountRub = Form.useWatch('discount_rub', form)
  const discountUsd = Form.useWatch('discount_usd', form)
  const payUsd = Form.useWatch('pay_usd', form)
  const rate = Form.useWatch('rate', form)

  useEffect(() => {
    if (!Number(payUsd) || !Number(rate)) return
    form.setFieldValue('pay_rub', Number(payUsd) * Number(rate))
  }, [payUsd, rate])

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
          params.total_rub = params.pay_rub - params.discount_rub
          if (isNew) {
            const created = await axios.postWithAuth('/query/insert', { sql:
              sqlInsert('dataset', {
                status: 0,
                tip: 'dr-invoice',
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
          navigate('/drivers-invoices')
        }}
      >
        <Row align='middle' style={{ padding: '0 40px' }}>
          <Col span={12}>
            <Typography.Title style={{ fontWeight: 'bold' }}>{isNew ? 'Новый счет перевозчика' : `Счет перевозчика`}</Typography.Title>
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
              onClick={() => navigate('/drivers-invoices', { state: { refetch: 1 }})}
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
                  disabled={!!data.driver}
                  showSearch
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
                    { value: 'Бесплатно', title: '' },
                    { value: 'Наличный', title: '' },
                    { value: 'Безналичный', title: '' },
                  ]}
                  rules={[{ required: true }]}
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
              <Col span={4}>
                <FormField
                  label='Скидка ($)'
                  addonAfter='$'
                  name='discount_usd'
                  type='number'
                  disabled={!!discountRub}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Скидка (₽)'
                  addonAfter='₽'
                  name='discount_rub'
                  type='number'
                  disabled={!!discountUsd}
                />
              </Col>
              <Col span={24}>
                <FormField
                  label='Описание скидки'
                  name='discount_note'
                  rules={[ { required: !!discountUsd || !!discountRub } ]}
                />
              </Col>
              <Col span={4}>
                <Form.Item dependencies={['pay_usd', 'discount_usd']}>
                  {({ getFieldValue }) => {
                    const pay = getFieldValue('pay_usd') || 0
                    const discount = getFieldValue('discount_usd') || 0
                    return (
                      <FormField
                        label='К оплате ($)'
                        labelType='calc'
                        addonAfter='$'
                        type='number'
                        value={pay - discount}
                        disabled
                      />
                    )
                  }}
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item dependencies={['pay_rub', 'discount_rub']} shouldUpdate>
                  {({ getFieldValue }) => {
                    const pay = getFieldValue('pay_rub') || 0
                    const discount = getFieldValue('discount_rub') || 0
                    return (
                      <FormField
                        label='К оплате (₽)'
                        labelType='calc'
                        addonAfter='₽'
                        type='number'
                        value={pay - discount}
                        disabled
                      />
                    )
                  }}
                </Form.Item>
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
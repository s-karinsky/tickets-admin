import { useEffect, useState } from 'react'
import { Row, Col, Typography, Form, Button, DatePicker, Modal } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { LoadingOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import { get as _get } from 'lodash'
import FormField from '../../components/FormField'
import { useClientInvoices } from '../../utils/api'
import axios from '../../utils/axios'
import { numberRange } from '../../utils/validationRules'
import { VALIDATION_MESSAGES } from '../../consts'
import { sqlInsert, sqlUpdate } from '../../utils/sql'

export default function ClientInvoicesForm() {
  const [ isModal, setIsModal ] = useState()
  const [ doneDate, setDoneDate ] = useState()
  const [ isUpdating, setIsUpdating ] = useState(false)
  const [ form ] = Form.useForm()
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'create'
  const { data = {}, isLoading, isRefetching, refetch } = useClientInvoices(id, {}, { staleTime: 0, refetchOnWindowFocus: false })

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
          if (isNew) {
            await axios.postWithAuth('/query/insert', { sql:
              sqlInsert('dataset', {
                status: 0,
                tip: 'cl-invoice',
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
                if (!data.done) setIsModal(true)
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
                  disabled
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
                    const pay = getFieldValue('pay_usd')
                    const discount = getFieldValue('discount_usd')
                    return (
                      <FormField
                        label='К оплате ($)'
                        addonAfter='$'
                        name='total_usd'
                        type='number'
                        value={pay - discount}
                        disabled
                      />
                    )
                  }}
                </Form.Item>
              </Col>
              <Col span={4}>
                <Form.Item dependencies={['pay_rub', 'discount_rub']}>
                  {({ getFieldValue }) => {
                    const pay = getFieldValue('pay_rub')
                    const discount = getFieldValue('discount_rub')
                    return (
                      <FormField
                        label='К оплате (₽)'
                        addonAfter='₽'
                        name='total_rub'
                        type='number'
                        value={pay - discount}
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
                  name='total_usd'
                  type='number'
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Сумма товара (₽)'
                  addonAfter='₽'
                  name='total_rub'
                  type='number'
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Баллы'
                  name='scores'
                  type='number'
                  width='100%'
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
import { useState } from 'react'
import { Row, Col, Typography, Form, Button } from 'antd'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { LoadingOutlined } from '@ant-design/icons'
import { get as _get } from 'lodash'
import FormField from '../../components/FormField'
import { useClientInvoices } from '../../utils/api'
// import axios from '../../utils/axios'
import { numberRange } from '../../utils/validationRules'
import { VALIDATION_MESSAGES } from '../../consts'

export default function DictionaryForm() {
  const [ isUpdating, setIsUpdating ] = useState(false)
  const location = useLocation()
  const [ form ] = Form.useForm()
  const { name, id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'create'
  const { data = {}, isLoading } = useClientInvoices(id)

  const discountRub = Form.useWatch('discount_rub', form)
  const discountUsd = Form.useWatch('discount_usd', form)

  return isLoading ?
    <Row style={{ height: 'calc(100vh - 64px)' }} justify='center' align='middle'>
      <LoadingOutlined style={{ fontSize: '64px' }} /> : 
    </Row> :
    <>
      <Form
        validateMessages={VALIDATION_MESSAGES}
        layout='vertical'
        size='large'
        initialValues={data}
        form={form}
        onFinish={async (values) => {
          setIsUpdating(true)
          if (isNew) {
            
          } else {

          }
          navigate('/client-invoices')
        }}
      >
        <Row align='middle' style={{ padding: '0 40px' }}>
          <Col span={12}>
            <Typography.Title style={{ fontWeight: 'bold' }}>{isNew ? 'Новый счет на оплату клиента' : `Счет на оплату клиента`}</Typography.Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
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
              onClick={() => navigate('/client-invoices')}
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
    </>
}
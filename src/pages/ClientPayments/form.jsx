import { useState, useMemo } from 'react'
import { Row, Col, Typography, Form, Button, Checkbox } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { LoadingOutlined } from '@ant-design/icons'
import { get as _get } from 'lodash'
import FormField from '../../components/FormField'
import { useClientInvoices, useUsersWithRole } from '../../utils/api'
// import axios from '../../utils/axios'
import { numberRange } from '../../utils/validationRules'
import { VALIDATION_MESSAGES } from '../../consts'

export default function ClientPaymentsForm() {
  const [ isUpdating, setIsUpdating ] = useState(false)
  const [ form ] = Form.useForm()
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'create'
  const { data = {}, isLoading } = useClientInvoices(id)
  const employe = useUsersWithRole('2')

  const employeOptions = useMemo(() => {
    if (!employe.data) return []
    console.log(employe.data)
    return employe.data.map(item => ({
      value: item.id_user,
      label: item.json?.code
    }))
  }, [employe.data])

  const payType = Form.useWatch('pay_type', form)
  const isCash = payType?.toLowerCase() === 'Наличный'

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
            <Typography.Title style={{ fontWeight: 'bold' }}>{isNew ? 'Новая оплата клиента' : `Оплата клиента`}</Typography.Title>
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
                  disabled
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Клиент'
                  name='inclient'
                  disabled
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Номер счета'
                  name='invoice_number'
                  disabled
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Дата счета'
                  name='invoice_date'
                  type='date'
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
                  rules={[ { required: isCash } ]}
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
    </>
}
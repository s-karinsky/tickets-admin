import { useEffect } from 'react'
import { Button, Form, Row, Col, Checkbox, message } from 'antd'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { LoadingOutlined } from '@ant-design/icons'
import axios from '../../utils/axios'
import SelectUser from '../../components/SelectUser'
import FormField from '../../components/FormField'
import Wrapper from '../../components/Wrapper'
import { useCompanyIncome } from '../../utils/hooks'
import { NEW_ID, VALIDATION_MESSAGES, PAY_TYPES } from '../../consts'
import { ROOT_PATH } from '.'

export default function CompanyIncomeItem() {
  const [ messageApi, contextHolder ] = message.useMessage()
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading, refetch } = useCompanyIncome(id)
  const [ form ] = Form.useForm()
  const isInner = Form.useWatch('inner', form)

  const payUsd = Form.useWatch('pay_usd', form)
  const rate = Form.useWatch('rate', form)

  useEffect(() => {
    let pay = payUsd
    if (typeof pay === 'string') {
      pay = pay.replaceAll(' ', '').replaceAll(',', '.')
    }
    if (!(Number(pay) * Number(rate))) return
    form.setFieldValue('pay_rub', Number(pay) * Number(rate))
  }, [payUsd, rate])
  
  if (isLoading) {
    return (
      <Row style={{ height: 'calc(100vh - 64px)' }} justify='center' align='middle'>
        <LoadingOutlined style={{ fontSize: '64px' }} />
      </Row>
    )
  }
  
  const isNew = id === NEW_ID
  const title = isNew ? 'Новый приход средств' : `Приход средств №${data.number}`

  return (
    <Wrapper
      title={title}
      breadcrumbs={[ { title: <Link to={ROOT_PATH}>Приход средств компании</Link> }, { title } ]}
      buttons={[
        <Button
          onClick={() => form.submit()}
          type='primary'
          size='large'
        >
          Сохранить
        </Button>
      ]}
    >
      <Form
        initialValues={data}
        form={form}
        validateMessages={VALIDATION_MESSAGES}
        layout='vertical'
        size='large'
        style={{ margin: '0 20px' }}
        onFinish={async (values) => {
          const response = await axios.insert('dataset', { tip: 'com-income', status: 0, pole: JSON.stringify(values) })
          const id = response.data?.data?.id
          if (id) {
            navigate(`${ROOT_PATH}/${id}`)
            messageApi.success('Запись успешно добавлена')
          } else {
            messageApi.error(response.data?.message)
          }
        }}
      >
        <Row gutter={[10, 20]} align='middle'>
          <Col span={4}>
            <FormField
              type='number'
              name='number'
              label='Номер'
              rules={[{ required: true }]}
              width='100%'
            />
          </Col>
          <Col span={4}>
            <FormField
              type='date'
              name='date'
              label='Дата'
              rules={[{ required: true }]}
              width='100%'
            />
          </Col>
          <Col span={4}>
            <Form.Item
              width='100%'
              name='inner'
              valuePropName='checked'
              style={{ marginTop: 10 }}
            >
              <Checkbox>Внутренние расчеты</Checkbox>
            </Form.Item>
          </Col>
          <Col span={6}>
            <SelectUser
              role='1'
              name='client_passed'
              rules={[{ required: isInner }]}
              label='Передал'
            />
          </Col>
          <Col span={6}>
            <SelectUser
              role='1'
              name='client_received'
              rules={[{ required: isInner }]}
              label='Получил'
            />
          </Col>
          <Col span={4}>
            <FormField
              label='Тип средств'
              type='select'
              options={PAY_TYPES}
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={4}>
            <FormField
              type='date'
              name='income_date'
              label='Дата прихода'
              rules={[{ required: true }]}
              width='100%'
            />
          </Col>
          <Col span={16}>
            <FormField
              name='name'
              label='Наименование'
              rules={[{ required: true }]}
              width='100%'
            />
          </Col>
          <Col span={4}>
            <FormField
              type='number'
              name='rate'
              label='Курс 1$'
              width='100%'
            />
          </Col>
          <Col span={4}>
            <FormField
              type='number'
              name='pay_usd'
              label='Сумма ($)'
              width='100%'
            />
          </Col>
          <Col span={4}>
            <FormField
              type='number'
              name='pay_rub'
              label='Сумма (₽)'
              width='100%'
            />
          </Col>
        </Row>
      </Form>
      {contextHolder}
    </Wrapper>
  )
}
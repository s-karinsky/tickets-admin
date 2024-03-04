import { useEffect, useState } from 'react'
import { Button, Form, Row, Col, Checkbox, Modal, message } from 'antd'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { LoadingOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import axios from '../../utils/axios'
import MakePaymentModal from '../../components/MakePaymentModal'
import FormField from '../../components/FormField'
import Wrapper from '../../components/Wrapper'
import { useProductsCategory } from '../../utils/hooks'
import { NEW_ID, VALIDATION_MESSAGES, PAY_TYPES, RATE_PRICE_TYPES } from '../../consts'

export default function ProductsCategory() {
  const [ modal, setModal ] = useState()
  const [ messageApi, contextHolder ] = message.useMessage()
  const navigate = useNavigate()
  const { id, categoryId } = useParams()
  const { data, isLoading, refetch } = useProductsCategory(categoryId)
  const [ form ] = Form.useForm()
  
  if (isLoading) {
    return (
      <Row style={{ height: 'calc(100vh - 64px)' }} justify='center' align='middle'>
        <LoadingOutlined style={{ fontSize: '64px' }} />
      </Row>
    )
  }
  
  const isNew = categoryId === NEW_ID
  const title = isNew ? 'Новая категория товаров' : `Категория товаров ${data.value}`

  return (
    <Wrapper
      title={title}
      breadcrumbs={[ { title: <Link to='/dictionary/rates'>Тарифы</Link> }, { title: <Link to={`/dictionary/rates/${id}`}>Тариф</Link> }, { title } ]}
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
          if (isNew) {
            const response = await axios.insert('sprset', { tip: 'prod-cat', id_ref: id, ref_tip: 'rate', status: 0, pole: JSON.stringify(values) })
            const newId = response.data?.data?.id
            if (newId) {
              messageApi.success('Запись успешно добавлена')
            } else {
              messageApi.error(response.data?.message)
            }
          } else {
            await axios.update('sprset', { pole: JSON.stringify({ ...data.pole, ...values }) }, `id=${categoryId}`)
            messageApi.success('Запись успешно обновлена')
          }
        }}
      >
        <Row gutter={[10, 20]} align='middle'>
          <Col span={4}>
            <FormField
              name='value'
              label='Код'
              rules={[{ required: true }]}
              width='100%'
            />
          </Col>
          <Col span={4}>
            <FormField
              name='pay_type'
              label='Тип средств'
              type='select'
              options={PAY_TYPES}
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={16}>
            <FormField
              name='label'
              label='Наименование'
              rules={[{ required: true }]}
              width='100%'
            />
          </Col>
          <Col span={4}>
            <FormField
              type='number'
              name='price_kg'
              label='Цена'
              width='100%'
              rules={[{ required: true }]}
            />
          </Col>
          <Col span={4}>
            <FormField
              type='select'
              options={RATE_PRICE_TYPES}
              name='price_type'
              label='Цена за'
            />
          </Col>
        </Row>
      </Form>
      {modal && <MakePaymentModal
        title='Выберите дату проведения'
        onOk={async (date) => {
          await axios.update('dataset', { pole: JSON.stringify({ ...data.pole, done: true, done_date: date.format('YYYY-MM-DD') }) }, `id=${id}`)
          refetch()
          setModal(false)
        }}
        onCancel={() => setModal(false)}
      />}
      {contextHolder}
    </Wrapper>
  )
}
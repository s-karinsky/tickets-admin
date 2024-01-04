import { useState } from 'react'
import { Row, Col, Typography, Form, Button } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { LoadingOutlined } from '@ant-design/icons'
import FormField from '../../components/FormField'
import { useDictionary } from '../../utils/api'
import axios from '../../utils/axios'
import { numberRange } from '../../utils/validationRules'
import { sqlInsert, sqlUpdate } from '../../utils/sql'
import { VALIDATION_MESSAGES } from '../../consts'

const getTitle = (name, value, isNew) => {
  switch (name) {
    case 'drivers':
      return isNew ? 'Новый перевозчик' : `Перевозчик ${value}`

    case 'rates':
      return isNew ? 'Новый тариф' : `Тариф ${value}`

    case 'currency':
      return isNew ? 'Новая валюта' : `Валюта ${value}`
  
    default:
      return ''
  }
}

export default function DictionaryForm() {
  const [ isUpdating, setIsUpdating ] = useState(false)
  const { name, id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'create'
  const { data = {}, isLoading } = useDictionary(name, id)

  return isLoading ?
    <Row style={{ height: 'calc(100vh - 64px)' }} justify='center' align='middle'>
      <LoadingOutlined style={{ fontSize: '64px' }} /> : 
    </Row> :
    <Form
      validateMessages={VALIDATION_MESSAGES}
      layout='vertical'
      size='large'
      initialValues={data}
      onFinish={async (values) => {
        setIsUpdating(true)
        if (isNew) {
          await axios.postWithAuth('/query/insert', { sql: sqlInsert('sprset', { tip: name, pole: JSON.stringify(values) }) })
        } else {
          await axios.postWithAuth('/query/update', { sql: sqlUpdate('sprset', { pole: JSON.stringify(values) }, `id=${id}`) })
        }
        navigate(`/dictionary/${name}`)
      }}
    >
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>{getTitle(name, data.value || '', isNew)}</Typography.Title>
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
            onClick={() => navigate(`/dictionary/${name}`)}
            danger
          >
            Отмена
          </Button>
        </Col>
        <Col span={24}>
          <Row gutter={10}>
            {name === 'rates' && <>
              <Col span={4}>
                <FormField
                  label='Код'
                  name='value'
                  rules={[{ required: true }]}
                />
              </Col>
              <Col span={12}>
                <FormField
                  label='Наименование'
                  name='label'
                  rules={[{ required: true }]}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Тип оплаты'
                  name='pay_type'
                  type='select'
                  options={[ { value: 'Наличный' }, { value: 'Безналичный' }]}
                  rules={[{ required: true }]}
                />
              </Col>
              <Col span={4}>
                <FormField
                  label='Цена за 1 кг'
                  addonAfter='$'
                  name='price_kg'
                  type='number'
                  rules={[{ required: true }, ...numberRange({ min: 1 })]}
                />
              </Col>
              <Col span={24}>
                <FormField
                  label='Примечание'
                  name='note'
                  type='textarea'
                />
              </Col>
            </>}
          </Row>
        </Col>
      </Row>
    </Form>
}
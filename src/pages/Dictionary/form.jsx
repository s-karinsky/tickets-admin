import { useState, useEffect } from 'react'
import { Row, Col, Typography, Form, Button, Divider } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { get as _get } from 'lodash'
import FormField from '../../components/FormField'
import CreateCityModal from '../../components/CreateCityModal'
import { useDictionary, useCities, useCountries } from '../../utils/api'
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
  const [ isAddCity, setIsAddCity ] = useState()
  const [ country, setCountry ] = useState()
  const [ form ] = Form.useForm()
  const { name, id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'create'
  const { data = {}, isLoading } = useDictionary(name, id)
  const countries = useCountries()
  const cities = useCities(country)

  useEffect(() => {
    if (isLoading || !data.country) return
    setCountry(data.country)
  }, [!isLoading, data.country])

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
        onFieldsChange={fields => {
          const field = fields.find(field => _get(field, ['name', 0]) === 'country')
          if (!field) return
          if (field.value !== country) {
            form.setFieldValue('city')
          }
          setCountry(field.value)
        }}
        onFinish={async (values) => {
          setIsUpdating(true)
          if (isNew) {
            await axios.postWithAuth('/query/insert', { sql: sqlInsert('sprset', { status: 0, tip: name, pole: JSON.stringify(values) }) })
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
              <Col span={4}>
                <FormField
                  label='Код'
                  name='value'
                  rules={[{ required: true }]}
                />
              </Col>
              {name === 'rates' && <>
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
              {name === 'drivers' && <>
                <Col span={20}>
                  <FormField
                    label='Наименование компании'
                    name='company_name'
                    rules={[{ required: true }]}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='Фамилия ответственного'
                    name='family'
                    rules={[{ required: true }]}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='Имя ответственного'
                    name='name'
                    rules={[{ required: true }]}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='Отчество ответственного'
                    name='middle'
                  />
                </Col>
                <Col span={6}>
                  <FormField
                    label='Телефон ответственного'
                    name='phone'
                    rules={[{ required: true }]}
                    size='large'
                    mask='+000000000000'
                  />
                </Col>
                <Col span={6}>
                  <FormField
                    label='Телефон компании'
                    name='company_phone'
                    rules={[{ required: true }]}
                    size='large'
                    mask='+000000000000'
                  />
                </Col>
                <Col span={6}>
                  <FormField
                    type='select'
                    name='country'
                    label='Страна'
                    options={countries.data?.list || []}
                  />
                </Col>
                <Col span={6}>
                  <FormField
                    type='select'
                    name='city'
                    label='Город'
                    options={cities.data?.list || []}
                    dropdownRender={(menu) => (
                      <>
                        {menu}
                        <Divider style={{ margin: '8px 0' }} />
                        <Button
                          type='text'
                          icon={<PlusOutlined />}
                          onClick={() => setIsAddCity(true)}
                          block
                        >
                          Добавить город
                        </Button>
                      </>
                    )}
                    filterOption={(input, { label, value } = {}) => (label ?? '').toLowerCase().includes(input.toLowerCase())}
                    showSearch
                  />
                </Col>
              </>}
            </Row>
          </Col>
        </Row>
      </Form>
      <CreateCityModal
        isOpen={isAddCity}
        onOk={values => {
          if (values.country !== country) {
            setCountry(values.country)
          } else {
            cities.refetch()
          }
          form.setFieldValue('city', values.id)
        }}
        onClose={() => setIsAddCity(false)}
        initialValues={{
          country
        }}
        countries={countries.data?.list || []}
      />
    </>
}
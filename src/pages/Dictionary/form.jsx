import { useState, useEffect } from 'react'
import { Row, Col, Typography, Form, Button, Divider, Table } from 'antd'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { get as _get } from 'lodash'
import FormField from '../../components/FormField'
import CreateCityModal from '../../components/CreateCityModal'
import { useDictionary, useCities, useCountries } from '../../utils/api'
import { useProductsCategory } from '../../utils/hooks'
import axios from '../../utils/axios'
import { numberRange, emailRule } from '../../utils/validationRules'
import { sqlInsert, sqlUpdate } from '../../utils/sql'
import { VALIDATION_MESSAGES, RATE_PRICE_TYPES } from '../../consts'

const getTitle = (name, value, isNew) => {
  switch (name) {
    case 'drivers':
      return isNew ? 'Новый перевозчик' : `Перевозчик ${value}`

    case 'rates':
      return isNew ? 'Новый тариф' : `Тариф ${value}`

    case 'currency':
      return isNew ? 'Новая валюта' : `Валюта ${value}`

    case 'inclient':
      return isNew ? 'Новый внутренний клиент' : `Внутренний клиент ${value}`
  
    default:
      return ''
  }
}

const productCategoryColumns = [
  {
    title: 'Код',
    dataIndex: 'value'
  }, {
    title: 'Наименование',
    dataIndex: 'label'
  }, {
    title: 'Тип оплаты',
    dataIndex: 'pay_type'
  }, {
    title: 'Цена',
    dataIndex: 'price_kg'
  }, {
    title: 'Цена за',
    dataIndex: 'price_type',
    render: val => RATE_PRICE_TYPES.find(item => item.value === val)?.label
  }, {
    title: 'Примечание',
    dataIndex: 'note'
  }
]

export default function DictionaryForm() {
  const [ isUpdating, setIsUpdating ] = useState(false)
  const [ isAddCity, setIsAddCity ] = useState()
  const [ country, setCountry ] = useState()
  const location = useLocation()
  const [ form ] = Form.useForm()
  const { name, id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'create'
  const { data = {}, isLoading } = useDictionary(name, { id })
  const productCategory = useProductsCategory({ id_ref: id }, { enabled: name === 'rates' })
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
            const optional = {}
            if (location.state && location.state.clientId) {
              optional.id_ref = location.state.clientId
              optional.ref_tip = 'user'
            }
            await axios.postWithAuth('/query/insert', { sql: sqlInsert('sprset', { ...optional, status: 0, tip: name, pole: JSON.stringify(values) }) })
          } else {
            await axios.postWithAuth('/query/update', { sql: sqlUpdate('sprset', { pole: JSON.stringify(values) }, `id=${id}`) })
          }
          if (name === 'inclient') {
            navigate(`/dictionary/clients/${location?.state?.clientId || data.id_ref}`)
          } else {
            navigate(`/dictionary/${name}`)
          }
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
              onClick={() => name === 'inclient' ? navigate(`/dictionary/clients/${location?.state?.clientId || data.id_ref}`) : navigate(`/dictionary/${name}`)}
              danger
            >
              Отмена
            </Button>
          </Col>
          <Col span={24}>
            <Row gutter={10}>
              <Col span={name === 'inclient' ? 3 : 4}>
                <FormField
                  label='Код'
                  name={name === 'rates' ? 'code' : 'value'}
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
                    mask='+00000000000[0]'
                  />
                </Col>
                <Col span={6}>
                  <FormField
                    label='Телефон компании'
                    name='company_phone'
                    rules={[{ required: true }]}
                    size='large'
                    mask='+00000000000[0]'
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
                <Col span={24}>
                  <FormField
                    type='textarea'
                    label='Примечание'
                    name='note'
                    text={data?.note}
                  />
                </Col>
              </>}

              {name === 'inclient' && <>
                <Col span={7}>
                  <FormField
                    name='family'
                    label='Фамилия'
                    rules={[{ required: true }]}
                  />
                </Col>
                <Col span={7}>
                  <FormField
                    name='name'
                    label='Имя'
                    rules={[{ required: true }]}
                  />
                </Col>
                <Col span={7}>
                  <FormField
                    name='middle'
                    label='Отчество'
                    rules={[{ required: true }]}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    name='phone'
                    label={'Телефон'}
                    rules={[{ required: true }]}
                    size='large'
                    mask='+00000000000[0]'
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    type='select'
                    name='country'
                    label='Страна'
                    options={countries.data?.list || []}
                    text={(countries.data?.map || {})[data?.country]?.label}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    type='select'
                    name='city'
                    label='Город'
                    options={cities.data?.list || []}
                    text={(cities.data?.map || {})[data?.city]?.label}
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
                <Col span={24}>
                  <FormField
                    type='textarea'
                    name={['json', 'note']}
                    label='Примечание'
                  />
                </Col>
                <Col span={24}>
                  <fieldset style={{ padding: 10, margin: '20px 10px' }}>
                    <legend>Юридическое лицо</legend>
                    <Row
                      gutter={16}
                    >
                      <Col span={6}>
                        <FormField
                          label='Компания/ИП'
                          name={['company', 'name']}
                        />
                      </Col>
                      <Col span={6}>
                        <FormField
                          label='Руководитель'
                          name={['company', 'head']}
                        />
                      </Col>
                      <Col span={6}>
                        <FormField
                          label='ИНН/УНП'
                          name={['company', 'inn']}
                        />
                      </Col>
                      <Col span={6}>
                        <FormField
                          label='ОГРН/ОГРНИП'
                          name={['company', 'ogrn']}
                        />
                      </Col>
                      <Col span={8}>
                        <FormField
                          label='Свидетельство о регистрации'
                          name={['company', 'certificate']}
                        />
                      </Col>
                      <Col span={8}>
                        <FormField
                          label='Юридический адрес'
                          name={['company', 'address']}
                        />
                      </Col>
                      <Col span={8}>
                        <FormField
                          label='Телефон'
                          name={['company', 'phone']}
                          size='large'
                          mask='+00000000000[0]'
                        />
                      </Col>
                      <Col span={8}>
                        <FormField
                          label='E-mail'
                          name={['company', 'email']}
                          rules={[emailRule('Введите корректный e-mail')]}
                        />
                      </Col>
                      <Col span={8}>
                        <FormField
                          label='Адрес разгрузки'
                          name={['company', 'unloadAddress']}
                        />
                      </Col>
                      <Col span={8}>
                        <FormField
                          label='Наименование банка'
                          name={['company', 'bank']}
                        />
                      </Col>
                      <Col span={8}>
                        <FormField
                          label='БИК банка'
                          name={['company', 'bik']}
                        />
                      </Col>
                      <Col span={8}>
                        <FormField
                          label='SWIFT или Кор. счет'
                          name={['company', 'swift']}
                        />
                      </Col>
                      <Col span={8}>
                        <FormField
                          label='Расчетный счет'
                          name={['company', 'checkingAccount']}
                        />
                      </Col>
                      <Col span={8}>
                        <FormField
                          label='Адрес банка'
                          name={['company', 'bankAddress']}
                        />
                      </Col>
                    </Row>
                  </fieldset>
                </Col>
              </>}
            </Row>
          </Col>
        </Row>
      </Form>
      {name === 'rates' && !isNew && <>
        <Row justify='space-between' align='bottom' style={{ margin: '20px 40px' }}>
          <Col>
            <Typography.Title
              level={1}
              style={{ fontWeight: '700', marginBottom: '0' }}
            >
              Категории товаров
            </Typography.Title>
          </Col>
          <Col>
            <Button
              type='primary'
              size='large'
              onClick={() => navigate(`/dictionary/rates/${id}/create`)}
            >
              Создать
            </Button>
          </Col>
        </Row>
        <Table
          columns={productCategoryColumns}
          dataSource={productCategory.data}
          loading={productCategory.isLoading}
          onRow={record => ({
            onClick: (e) => {
              if (e.detail === 2) {
                navigate(`/dictionary/rates/${id}/${record.id}`)
              }
            },
          })}
        />
      </>}
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
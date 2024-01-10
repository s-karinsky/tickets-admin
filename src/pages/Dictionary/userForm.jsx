import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Form, Button, Col, Row, Divider, Typography, Table } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import CreateCityModal from '../../components/CreateCityModal'
import FormField from '../../components/FormField'
import { getColumns } from '../Users'
import { useCountries, useCities, useUsers, createUser, updateUserById, useDictionary } from '../../utils/api'
import { emailRule } from '../../utils/validationRules'
import { VALIDATION_MESSAGES } from '../../consts'

const EMPTY_OBJECT = {}

const getTitle = (name, value, isNew) => {
  switch (name) {
    case 'clients':
      return isNew ? 'Новый клиент' : `Клиент ${value}`

    case 'employees':
      return isNew ? 'Новый сотрудник' : `Сотрудник ${value}`

    default:
      return ''
  }
}

export default function UserForm({ name }) {
  const [ form ] = Form.useForm()
  const { id } = useParams()
  const navigate = useNavigate()
  const [ isAddCity, setIsAddCity ] = useState(false)
  const [ country, setCountry ] = useState()
  const [ isSending, setIsSending ] = useState()
  const users = useUsers(id, {}, { cacheTime: 0 })
  const profile = users.data || EMPTY_OBJECT
  const isClient = name === 'clients'
  const inner = useDictionary('inclient', { id_ref: id }, { enabled: isClient })
  const countries = useCountries()
  const cities = useCities(country)

  useEffect(() => {
    if (profile.isLoading) return
    setCountry(profile.json?.country)
  }, [profile])

  const isNew = id === 'create'

  if (users.isLoading) return null

  return (
    <>
      <Form
        initialValues={profile}
        layout='vertical'
        size='large'
        validateMessages={VALIDATION_MESSAGES}
        form={form}
        onFieldsChange={fields => {
          const field = fields.find(field => Array.isArray(field.name) && field.name.join('.') === 'json.country')
          if (!field) return
          if (field.value !== country) {
            form.setFieldValue(['json', 'city'])
          }
          setCountry(field.value)
        }}
        onFinish={async (values) => {
          const isClient = values.id_role === '1'
          values.phone = values.phone.replaceAll('_', '')
          if (isClient) {
            values.json.addPhone = (values.addPhone || '').replaceAll('_', '')
            values.json.company.phone = (values.json.company.phone || '').replaceAll('_', '')
          } else {
            values.json.companyPhone = (values.json.companyPhone || '').replaceAll('_', '')
          }
          values.json = JSON.stringify(values.json)
          setIsSending(true)
          if (isNew) {
            const lastId = await createUser(values)
            navigate(`/dictionary/${name}/${lastId}`)
          } else {
            await updateUserById(id, values)
            navigate(`/dictionary/${name}`)
          }
          setIsSending(false)
        }}
      >
        <Row align='middle' style={{ padding: '0 40px' }}>
          <Col span={12}>
            <Typography.Title style={{ fontWeight: 'bold' }}>{getTitle(name, profile?.json?.code || '', isNew)}</Typography.Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button
              style={{ marginRight: 20 }}
              type='primary'
              size='large'
              htmlType='submit'
              loading={isSending}
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
        </Row>
        <Row
          gutter={16}
          style={{ margin: 10 }}
        >
          <Col span={3}>
            <FormField
              name={['json', 'code']}
              label='Код'
              rules={[{ required: true }]}
            />
          </Col>
        </Row>
        <Row
          gutter={16}
          style={{ margin: 10 }}
        >
          <Col span={8}>
            <FormField
              name='family'
              label={isClient ? 'Фамилия' : 'Фамилия ответственного'}
              rules={!isClient && [{ required: true }]}
            />
          </Col>
          <Col span={8}>
            <FormField
              name='name'
              label={isClient ? 'Имя' : 'Имя ответственного'}
              rules={!isClient && [{ required: true }]}
            />
          </Col>
          <Col span={8}>
            <FormField
              name='middle'
              label={isClient ? 'Отчество' : 'Отчество ответственного'}
            />
          </Col>
          <Col span={8}>
            <FormField
              name='email'
              label='E-mail'
              rules={[{ required: true }, emailRule('Введите корректный e-mail')]}
            />
          </Col>
          <Col span={8}>
            <FormField
              name='phone'
              label={isClient ? 'Телефон' : 'Телефон ответственного'}
              rules={[{ required: true }]}
              size='large'
              mask='+000000000000'
            />
          </Col>
          {!isClient && <Col span={8}>
            <FormField
              name={['json', 'companyName']}
              label='Название компании'
              rules={[{ required: true }]}
            />  
          </Col>}
          <Col span={8}>
            <FormField
              name={isClient ? ['json', 'addPhone'] : ['json', 'companyPhone']}
              label={isClient ? 'Дополнительный телефон' : 'Телефон компании'}
              size='large'
              mask='+000000000000'
              rules={!isClient && [{ required: true }]}
            />
          </Col>
          <Col span={8}>
            <FormField
              type='select'
              name={['json', 'country']}
              label='Страна'
              options={countries.data?.list || []}
              text={(countries.data?.map || {})[profile.json?.country]?.label}
            />
          </Col>
          <Col span={8}>
            <FormField
              type='select'
              name={['json', 'city']}
              label='Город'
              options={cities.data?.list || []}
              text={(cities.data?.map || {})[profile.json?.city]?.label}
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
        </Row>
        {isClient && 
          <fieldset style={{ padding: 10, margin: '20px 10px' }}>
            <legend>Юридическое лицо</legend>
            <Row
              gutter={16}
            >
              <Col span={8}>
                <FormField
                  label='Компания/ИП'
                  name={['json', 'company', 'name']}
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='Руководитель'
                  name={['json', 'company', 'head']}
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='ИНН/УНП'
                  name={['json', 'company', 'inn']}
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='Свидетельство о регистрации'
                  name={['json', 'company', 'certificate']}
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='Юридический адрес'
                  name={['json', 'company', 'address']}
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='Телефон'
                  name={['json', 'company', 'phone']}
                  size='large'
                  mask='+000000000000'
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='E-mail'
                  name={['json', 'company', 'email']}
                  rules={[emailRule('Введите корректный e-mail')]}
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='Адрес разгрузки'
                  name={['json', 'company', 'unloadAddress']}
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='Наименование банка'
                  name={['json', 'company', 'bank']}
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='БИК банка'
                  name={['json', 'company', 'bik']}
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='SWIFT'
                  name={['json', 'company', 'swift']}
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='Расчетный счет'
                  name={['json', 'company', 'checkingAccount']}
                />
              </Col>
              <Col span={8}>
                <FormField
                  label='Адрес банка'
                  name={['json', 'company', 'bankAddress']}
                />
              </Col>
            </Row>
          </fieldset>
        }
      </Form>
      {isClient && <>
        <Row align='middle' style={{ padding: '0 40px' }}>
          <Col span={12}>
            <Typography.Title style={{ fontWeight: 'bold' }}>Внутренние клиенты</Typography.Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button
              style={{ marginRight: 20 }}
              type='primary'
              size='large'
              onClick={() => navigate(`/dictionary/inclient/create`, { state: { clientId: id }})}
            >
              Создать
            </Button>
          </Col>
        </Row>
        <Table
          columns={getColumns({ codeIndex: 'value' }).slice(1, 4)}
          isLoading={inner.isLoading}
          dataSource={inner.data?.list}
          onRow={(record, index) => ({
            onClick: (e) => {
              if (e.detail === 2) {
                navigate(`/dictionary/inclient/${record.id}`)
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
          form.setFieldValue(['json', 'city'], values.id)
        }}
        onClose={() => setIsAddCity(false)}
        initialValues={{
          country
        }}
        countries={countries.data?.list || []}
      />
    </>
  )
}
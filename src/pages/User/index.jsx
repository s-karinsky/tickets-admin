import { useState, useMemo } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Form, Button, Col, Row } from 'antd'
import { CaretLeftFilled, SaveOutlined } from '@ant-design/icons'
import { BiEdit } from 'react-icons/bi'
import FormField from '../../components/FormField'
import { useUsers, createUser, updateUserById, useData } from '../../utils/api'
import { emailRule } from '../../utils/validationRules'
import { USER_ROLES, USER_ROLES_OPTIONS, VALIDATION_MESSAGES } from '../../consts'

export default function PageUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [ isSending, setIsSending ] = useState()
  const [ searchParams, setSearchParams ] = useSearchParams()
  const users = useUsers(id)
  const profile = users.data || {}

  const data = useData()

  const [ countriesOptions, citiesOptions ] = useMemo(() => {
    if (data.isLoading) return [[], []]
    const countries = data.data?.countries || {}
    const countriesOptions = Object.keys(countries).map(value => ({ value, label: countries[value].ru }))
    const cities = data.data?.cities || {}
    const citiesOptions = Object.keys(cities).map(value => ({ value, label: cities[value].ru, country: cities[value].country }))
    return [ countriesOptions, citiesOptions ]
  }, [data])

  const isNew = id === 'create'
  const isEdit = isNew || searchParams.get('edit') !== null

  if (users.isLoading) return null

  return (
    <Form
      initialValues={profile}
      layout='vertical'
      size='large'
      validateMessages={VALIDATION_MESSAGES}
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
          await createUser(values)
        } else {
          await updateUserById(id, values)
        }
        setIsSending(false)
      }}
    >
      <Row
        style={{
          borderBottom: '1px solid #ccc',
          padding: '10px 20px',
        }}
        justify='space-between'
      >
        <Col>
          <Button
            icon={<CaretLeftFilled />}
            onClick={() => navigate('/users')}
          >
            К списку пользователей
          </Button>
        </Col>
        <Col>
          {isEdit ?
            <Button
              icon={<SaveOutlined />}
              type='primary'
              htmlType='submit'
              style={{ marginRight: 10 }}
              disabled={isSending}
            >
              {isNew ? 'Содзать' : 'Сохранить'}
            </Button> :
            <Button
              icon={<BiEdit />}
              type='primary'
              htmlType='button'
              onClick={e => {
                e.preventDefault()
                navigate('?edit')
              }}
              style={{ marginRight: 10 }}
            >
              Редактировать
            </Button>
          }
          {isEdit && 
            <Button
              type='primary'
              onClick={() => {
                if (isNew) {
                  navigate('/users')
                } else {
                  setSearchParams({})
                  window.location.reload()
                } 
              }}
              danger
            >
              Отмена
            </Button>
            // :
            // <Button
            //   icon={<BsTrash />}
            //   type='primary'
            //   onClick={() => {
            //   }}
            //   danger
            // >
            //   Удалить
            // </Button>
          }
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
            isEdit={isEdit}
          />
        </Col>
        <Col span={5}>
          <FormField
            type='select'
            name='id_role'
            label='Роль'
            options={USER_ROLES_OPTIONS.map(value => ({ value, label: USER_ROLES[value] }))}
            text={USER_ROLES[profile.id_role]}
            rules={[{ required: true }]}
            isEdit={isEdit}
          />
        </Col>
      </Row>
      <Form.Item dependencies={['id_role']}>
        {({ getFieldValue }) => {
          const isClient = getFieldValue('id_role') === '1'
          return (
            <Row
              gutter={16}
              style={{ margin: 10 }}
            >
              <Col span={8}>
                <FormField
                  name='family'
                  label={isClient ? 'Фамилия' : 'Фамилия ответственного'}
                  isEdit={isEdit}
                  rules={!isClient && [{ required: true }]}
                />
              </Col>
              <Col span={8}>
                <FormField
                  name='name'
                  label={isClient ? 'Имя' : 'Имя ответственного'}
                  isEdit={isEdit}
                  rules={!isClient && [{ required: true }]}
                />
              </Col>
              <Col span={8}>
                <FormField
                  name='middle'
                  label={isClient ? 'Отчество' : 'Отчество ответственного'}
                  isEdit={isEdit}
                />
              </Col>
              <Col span={8}>
                <FormField
                  name='email'
                  label='E-mail'
                  rules={[{ required: true }, emailRule('Введите корректный e-mail')]}
                  isEdit={isEdit}
                />
              </Col>
              <Col span={8}>
                <FormField
                  name='phone'
                  label={isClient ? 'Телефон' : 'Телефон ответственного'}
                  rules={[{ required: true }]}
                  isEdit={isEdit}
                  size='large'
                  mask='+000000000000'
                />
              </Col>
              {!isClient && <Col span={8}>
                <FormField
                  name={['json', 'companyName']}
                  label='Название компании'
                  isEdit={isEdit}
                  rules={[{ required: true }]}
                />  
              </Col>}
              <Col span={8}>
                <FormField
                  name={isClient ? ['json', 'addPhone'] : ['json', 'companyPhone']}
                  label={isClient ? 'Дополнительный телефон' : 'Телефон компании'}
                  isEdit={isEdit}
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
                  options={countriesOptions}
                  isEdit={isEdit}
                  text={(data?.data?.countries || {})[profile.json?.country]?.ru}
                />
              </Col>
              <Col span={8}>
                <FormField
                  type='select'
                  name={['json', 'city']}
                  label='Город'
                  options={citiesOptions}
                  isEdit={isEdit}
                  text={(data?.data?.cities || {})[profile.json?.city]?.ru}
                />
              </Col>
              <Col span={24}>
                <FormField
                  type='textarea'
                  name={['json', 'note']}
                  label='Примечание'
                  isEdit={isEdit}
                />
              </Col>
            </Row>
          )
        }}
      </Form.Item>
      <Form.Item dependencies={['id_role']}>
        {({ getFieldValue }) => {
          const role = getFieldValue('id_role')
          return role === '2' ? null : (
            <fieldset style={{ padding: 10, margin: '20px 10px' }}>
              <legend>Юридическое лицо</legend>
              <Row
                gutter={16}
              >
                <Col span={8}>
                  <FormField
                    label='Компания/ИП'
                    isEdit={isEdit}
                    name={['json', 'company', 'name']}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='Руководитель'
                    isEdit={isEdit}
                    name={['json', 'company', 'head']}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='ИНН/УНП'
                    isEdit={isEdit}
                    name={['json', 'company', 'inn']}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='Свидетельство о регистрации'
                    isEdit={isEdit}
                    name={['json', 'company', 'certificate']}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='Юридический адрес'
                    isEdit={isEdit}
                    name={['json', 'company', 'address']}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='Телефон'
                    isEdit={isEdit}
                    name={['json', 'company', 'phone']}
                    size='large'
                    mask='+000000000000'
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='E-mail'
                    isEdit={isEdit}
                    name={['json', 'company', 'email']}
                    rules={[emailRule('Введите корректный e-mail')]}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='Адрес разгрузки'
                    isEdit={isEdit}
                    name={['json', 'company', 'unloadAddress']}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='Наименование банка'
                    isEdit={isEdit}
                    name={['json', 'company', 'bank']}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='БИК банка'
                    isEdit={isEdit}
                    name={['json', 'company', 'bik']}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='SWIFT'
                    isEdit={isEdit}
                    name={['json', 'company', 'swift']}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='Расчетный счет'
                    isEdit={isEdit}
                    name={['json', 'company', 'checkingAccount']}
                  />
                </Col>
                <Col span={8}>
                  <FormField
                    label='Адрес банка'
                    isEdit={isEdit}
                    name={['json', 'company', 'bankAddress']}
                  />
                </Col>
              </Row>
            </fieldset>
          )
        }}
      </Form.Item>
    </Form>
  )
}
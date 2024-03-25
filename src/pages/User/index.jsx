import { useState, useMemo } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { Form, Button, Col, Row, Table, Typography, message } from 'antd'
import { get, set } from 'lodash'
import { SaveOutlined } from '@ant-design/icons'
import { getFieldsByRole, getCommonFields, companyFields } from './forms'
import Wrapper from '../../components/Wrapper'
import DeleteButton from '../../components/DeleteButton'
import SelectCity from '../../components/SelectCity'
import FormField from '../../components/FormField'
import axios from '../../utils/axios'
import { useRoles } from '../../utils/hooks'
import { useUsers, createUser, updateUserById } from '../../utils/api'
import { getKeyFromName } from '../../utils/utils'
import { VALIDATION_MESSAGES, COLUMNS, USER_ROLES, USER_ROLES_PLURAL } from '../../consts'

const EMPTY_OBJECT = {}

const inclientColumns = [
  COLUMNS.code,
  COLUMNS.name,
  COLUMNS.phone,
  COLUMNS.company
]

const USER_LINK = {
  '1': '/dictionary/clients',
  '2': '/dictionary/employees',
  '4': '/users'
}

export default function PageUser() {
  const location = useLocation()
  const [ messageApi, contextHolder ] = message.useMessage()
  const [ form ] = Form.useForm()
  const { id } = useParams()
  const navigate = useNavigate()
  const [ isMakingPass, setIsMakingPass ] = useState(false)
  const [ isSending, setIsSending ] = useState()
  const initialRole = location.state?.role || '1'
  const users = useUsers(id, initialRole)
  const roles = useRoles()
  const profile = users.data || EMPTY_OBJECT

  const rolesOptions = useMemo(() => (roles.data || []).map(role => ({ ...role, value: role.id_role, label: role.name_ru })) || [], [roles.data])
  const rolesMap = useMemo(() => (roles.data || []).reduce((acc, role) => ({ ...acc, [role.id_role]: role.name_ru }), {}) || {}, [roles.data])

  const isNew = id === 'create'
  const role = Form.useWatch('id_role', form)
  const inclients = useUsers({ id_role: '3', create_user: id }, '', { enabled: role === '1' })
  const title = isNew ? 'Новый пользователь' : `${rolesMap[profile.id_role]} ${profile.json?.code}`

  const breadcrumbs = useMemo(() => {
    const crumbs = [{ title: <Link to={USER_LINK[profile.id_role]}>{rolesMap[profile.id_role]}</Link> }]
    if (isNew) {
      crumbs.push({ title: `Новый ${rolesMap[profile.id_role]?.toLowerCase()}` })
    } else {
      crumbs.push({ title })
    }
    return crumbs
  }, [profile.id_role, isNew, title])
  
  const columns = useMemo(() => [
    ...inclientColumns,
    {
      title: '',
      dataIndex: 'buttons',
      render: (_, item) => (<DeleteButton
        confirm='Вы действительно хотите удалить этого внутреннего клиента?'
        onOk={async () => {
          await axios.postWithAuth('/query/update', { sql: `UPDATE users SET deleted=1 WHERE id_user=${item.id_user}` })
          inclients.refetch()
        }}
      />)
    }
  ], [inclients])

  if (users.isLoading) return null

  return (
    <Wrapper
      title={title}
      breadcrumbs={breadcrumbs}
      buttons={[
        !isNew && <Button
          style={{ marginRight: 20 }}
          size='large'
          htmlType='button'
          onClick={async () => {
            setIsMakingPass(true)
            await axios.postWithAuth('/remind', { u_email: profile.email })
            message.info('Пароль для входа отправлен на e-mail')
            setIsMakingPass(false)
          }}
          loading={isMakingPass}
        >
          Сбросить пароль
        </Button>,
        <Button
          icon={<SaveOutlined />}
          type='primary'
          htmlType='submit'
          style={{ marginRight: 10 }}
          size='large'
          onClick={() => form.submit()}
          disabled={isSending}
        >
          Сохранить
        </Button>
      ].filter(Boolean)}
    >
      <Form
        initialValues={profile}
        layout='vertical'
        size='large'
        validateMessages={VALIDATION_MESSAGES}
        form={form}
        onFinish={async (values) => {
          const fields = getFieldsByRole(values.id_role)
          fields.forEach(field => {
            if (!field.mask) return
            const value = get(values, field.name)
            if (value) {
              set(values, field.name, value.replaceAll('_', ''))
            }
          })
          values.json = JSON.stringify(values.json)
          setIsSending(true)
          try {
            if (isNew) {
              const lastId = await createUser(values)
              navigate(`/users/${lastId}`)
              messageApi.success('Пользователь успешно создан')
            } else {
              await updateUserById(id, values)
              messageApi.success('Пользователь успешно обновлен')
            }
          } catch (e) {
            messageApi.error(e.message)
          } finally {
            setIsSending(false)
          }
        }}
      >
        <Row
          gutter={16}
          style={{ margin: 10 }}
        >
          {getCommonFields(profile, isNew, rolesOptions).map(({ span, ...field }) => (
            <Col span={span} key={getKeyFromName(field.name)}>
              <FormField
                {...field}
              />
            </Col>
          ))}
        </Row>
        <Form.Item dependencies={['id_role']}>
          {({ getFieldValue }) => {
            const fields = getFieldsByRole(getFieldValue('id_role'))
            return (
              <Row
                gutter={16}
                style={{ margin: 10 }}
              >
                {fields.map(({ span, ...field }) => (
                  field.type === 'city' ? 
                    <SelectCity
                      key={getKeyFromName(field.cityName)}
                      span={span}
                      defaultCountry={profile?.json?.country}
                      form={form}
                      showErrorMessage={messageApi.error}
                      {...field}
                    />
                    :
                    <Col span={span} key={getKeyFromName(field.name)}>
                      <FormField
                        {...field}
                        rules={[
                          ...(field.rules || []),
                          { required: field.required }
                        ]}
                        size='large'
                      />
                    </Col>
                ))}
              </Row>
            )
          }}
        </Form.Item>
        {role === '1' && <fieldset style={{ padding: 10, margin: '20px 10px' }}>
          <legend>Юридическое лицо</legend>
          <Row gutter={16}>
            {companyFields.map(({ span, ...field }) => (
              <Col span={span} key={getKeyFromName(field.name)}>
                <FormField
                  {...field}
                  rules={[
                    ...(field.rules || []),
                    { required: field.required }
                  ]}
                  size='large'
                />
              </Col>
            ))}
          </Row>
        </fieldset>}
      </Form>
      {role === '1' && !isNew && <>
        <Row align='middle' style={{ padding: '0 40px' }}>
          <Col span={12}>
            <Typography.Title style={{ fontWeight: 'bold' }}>Внутренние клиенты</Typography.Title>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button
              style={{ marginRight: 20 }}
              type='primary'
              size='large'
              onClick={() => navigate(`/users/${id}/create`, { state: { clientId: id }})}
            >
              Создать
            </Button>
          </Col>
        </Row>
        <Table
          size='small'
          columns={columns}
          isLoading={inclients.isLoading}
          dataSource={inclients.data}
          onRow={record => ({
            onClick: (e) => {
              if (e.detail === 2) {
                navigate(`/users/${id}/${record.id_user}`)
              }
            },
          })}
        />
      </>}
      {contextHolder}
    </Wrapper>
  )
}
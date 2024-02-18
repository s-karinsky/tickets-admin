import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Form, Button, Col, Row, Table, Typography, message } from 'antd'
import { get, set } from 'lodash'
import { CaretLeftFilled, SaveOutlined } from '@ant-design/icons'
import { getFieldsByRole, commonFields, companyFields } from './forms'
import Wrapper from '../../components/Wrapper'
import SelectCity from '../../components/SelectCity'
import FormField from '../../components/FormField'
import { useUsers, createUser, updateUserById } from '../../utils/api'
import { getKeyFromName } from '../../utils/utils'
import { VALIDATION_MESSAGES } from '../../consts'

const EMPTY_OBJECT = {}

export default function PageInclient() {
  const [ messageApi, contextHolder ] = message.useMessage()
  const [ form ] = Form.useForm()
  const { client, id } = useParams()
  const navigate = useNavigate()
  const [ isSending, setIsSending ] = useState()
  const clientData = useUsers(client)
  const users = useUsers(id, '3')
  const profile = users.data || EMPTY_OBJECT

  const isNew = id === 'create'
  const title = isNew ? 'Новый внутренний клиент' : `Внутренний клиент ${profile.json?.code}`

  const breadcrumbs = useMemo(() => {
    const crumbs = [{ title: <Link to='/dictionary/clients'>Клиенты</Link> }]
    if (clientData.data) {
      crumbs.push({ title: <Link to={`/users/${clientData.data.id_user}`}>{`Клиент ${clientData.data.json?.code}`}</Link> })
    }
    crumbs.push({ title })
    return crumbs
  }, [clientData.data, isNew, title])

  if (users.isLoading) return null

  return (
    <Wrapper
      title={title}
      breadcrumbs={breadcrumbs}
      buttons={
        <Button
          icon={<SaveOutlined />}
          type='primary'
          htmlType='submit'
          style={{ marginRight: 10 }}
          disabled={isSending}
          onClick={() => form.submit()}
          size='large'
        >
          Сохранить
        </Button>
      }
    >
      <Form
        initialValues={profile}
        layout='vertical'
        size='large'
        validateMessages={VALIDATION_MESSAGES}
        form={form}
        onFinish={async (values) => {
          values.id_role = '3'
          values.create_user = client
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
              navigate(`/users/${client}/${lastId}`)
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
          {commonFields.slice(0, 1).map(({ span, ...field }) => (
            <Col span={span} key={getKeyFromName(field.name)}>
              <FormField
                {...field}
                rules={[
                  ...(field.rules || []),
                  { required: field.required }
                ]}
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
        <fieldset style={{ padding: 10, margin: '20px 10px' }}>
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
        </fieldset>
      </Form>
      {contextHolder}
    </Wrapper>
  )
}
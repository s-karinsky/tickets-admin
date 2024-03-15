import { useEffect, useState } from 'react'
import { Button, Form, Row, Col, Checkbox, message } from 'antd'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { LoadingOutlined } from '@ant-design/icons'
import axios from '../../utils/axios'
import FormField from '../../components/FormField'
import Wrapper from '../../components/Wrapper'
import { useRoles } from '../../utils/hooks'
import { NEW_ID, VALIDATION_MESSAGES } from '../../consts'
import { menuKeys } from '../../components/Layout'
import { ROOT_PATH } from '.'

const getItemsValue = (items, val, current = {}) => {
  if (!items) return current
  return items.reduce((acc, item) => ({
    ...acc,
    [item.key]: val,
    ...getItemsValue(item.items, val, acc)
  }), current)
}

function CheckboxTree({ form, items = [] }) {
  return (
    <div style={{ paddingLeft: 20 }}>
      {items.map(item => (
        <div key={item.key}>
          <Form.Item
            name={['json', item.key]}
            valuePropName='checked'
          >
            <Checkbox
              onChange={e => {
                if (!item.items) return
                const values = getItemsValue(item.items, e.target.checked)
                Object.keys(values).forEach(key => {
                  form.setFieldValue(['json', key], values[key])
                })
              }}
            >
              {item.name}
            </Checkbox>
          </Form.Item>
          {!!item.items && <CheckboxTree form={form} items={item.items} />}
        </div>
      ))}
    </div>
  )
}

export default function RolesForm() {
  const [ messageApi, contextHolder ] = message.useMessage()
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading } = useRoles(id)
  const [ form ] = Form.useForm()


  if (isLoading) {
    return (
      <Row style={{ height: 'calc(100vh - 64px)' }} justify='center' align='middle'>
        <LoadingOutlined style={{ fontSize: '64px' }} />
      </Row>
    )
  }
  
  const isNew = id === NEW_ID
  const title = isNew ? 'Новая роль' : data.name_ru

  return (
    <Wrapper
      title={title}
      breadcrumbs={[ { title: <Link to={ROOT_PATH}>Роли пользователей</Link> }, { title } ]}
      buttons={[
        <Button
          onClick={() => form.submit()}
          type='primary'
          size='large'
        >
          Сохранить
        </Button>,
        <Button
          style={{ marginLeft: 10 }}
          onClick={() => navigate(ROOT_PATH)}
          type='primary'
          size='large'
          danger
        >
          Отмена
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
          values.json = JSON.stringify(
              Object.keys(values.json).reduce((acc, key) => ({
              ...acc,
              [key]: values.json[key] || false
            }), {})
          )
          if (isNew) {
            const response = await axios.insert('users_roles', values)
            const id = response.data?.data?.id
            if (id) {
              navigate(`${ROOT_PATH}/${id}`)
              messageApi.success('Запись успешно добавлена')
            } else {
              messageApi.error(response.data?.message)
            }
          } else {
            await axios.update('users_roles', values, `id_role=${id}`)
            messageApi.success('Запись успешно обновлена')
          }
        }}
      >
        <Row gutter={[10, 20]} align='middle'>
          <Col span={24}>
            <FormField
              name='name_ru'
              label='Название'
              rules={[{ required: true }]}
              width='100%'
            />
          </Col>
        </Row>
        <Row gutter={[10, 20]} style={{ marginTop: 30 }}>
          <Col span={24}>
            <b>Доступные разделы</b>
          </Col>
          {menuKeys.map(menu => (
            <Col span={4} key={menu.key}>
              <Form.Item
                name={['json', menu.key]}
                valuePropName='checked'
              >
                <Checkbox
                  onChange={e => {
                    if (!menu.items) return
                    const values = getItemsValue(menu.items, e.target.checked)
                    Object.keys(values).forEach(key => {
                      form.setFieldValue(['json', key], values[key])
                    })
                  }}
                >
                  {menu.name}
                </Checkbox>
              </Form.Item>
              {!!menu.items && <CheckboxTree form={form} items={menu.items} />}
            </Col>
          ))}
        </Row>
      </Form>
      {contextHolder}
    </Wrapper>
  )
}
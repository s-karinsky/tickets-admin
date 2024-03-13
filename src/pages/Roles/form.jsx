import { useEffect, useState } from 'react'
import { Button, Form, Row, Col, Checkbox, Modal, message } from 'antd'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { LoadingOutlined, ExclamationCircleFilled } from '@ant-design/icons'
import axios from '../../utils/axios'
import FormField from '../../components/FormField'
import Wrapper from '../../components/Wrapper'
import { useRoles } from '../../utils/hooks'
import { NEW_ID, VALIDATION_MESSAGES, PAY_TYPES } from '../../consts'
import { ROOT_PATH } from '.'

export default function RolesForm() {
  const [ modal, setModal ] = useState()
  const [ messageApi, contextHolder ] = message.useMessage()
  const navigate = useNavigate()
  const { id } = useParams()
  const { data, isLoading, refetch } = useRoles(id)
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
      </Form>
      {contextHolder}
    </Wrapper>
  )
}
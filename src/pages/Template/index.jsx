import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Form, Button, Col, Row, Typography, Checkbox } from 'antd'
import { CaretLeftFilled, SaveOutlined, PlusOutlined } from '@ant-design/icons'
import FormField from '../../components/FormField'
import { useTemplates } from '../../utils/api'
import { VALIDATION_MESSAGES } from '../../consts'
import axios from '../../utils/axios'
import { sqlInsert, sqlUpdate } from '../../utils/sql'

export default function Template() {
  const [ form ] = Form.useForm()
  const { id } = useParams()
  const navigate = useNavigate()
  const template = useTemplates(id)
  const isNew = id === 'create'

  if (template.isLoading) return null

  template.data.active = template.data?.active === '1' ? true : false

  return (
    <Form
      initialValues={template.data}
      layout='vertical'
      size='large'
      validateMessages={VALIDATION_MESSAGES}
      form={form}
      onFinish={async (values) => {
        values.active = values.active ? '1' : '0'
        if (isNew) {
          await axios.postWithAuth('/query/insert', { sql: sqlInsert('script_template', values) })
        } else {
          await axios.postWithAuth('/query/update', { sql: sqlUpdate('script_template', values, `id_script_template=${id}`) })
        }
        navigate('/templates')
      }}
    >
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>{isNew ? 'Новый шаблон' : `Шаблон ${id}`}</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            style={{ marginRight: 20 }}
            type='primary'
            size='large'
            htmlType='submit'
          >
            Сохранить
          </Button>
          <Button
            type='primary'
            size='large'
            htmlType='button'
            onClick={() => navigate(`/templates`)}
            danger
          >
            Отмена
          </Button>
        </Col>
        <Col span={24}>
          <Row gutter={10}>
            <Col span={8}>
              <FormField
                name='name_ru'
                label='Название'
              />
            </Col>
            <Col span={8}>
              <FormField
                name='value'
                label='value'
              />
            </Col>
            <Col span={8}>
              <FormField
                name='var'
                label='var'
              />
            </Col>
            <Col span={4}>
              <Form.Item
                width='100%'
                style={{ alignSelf: 'flex-end' }}
                name='active'
                valuePropName='checked'
              >
                <Checkbox>Активный</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      
    </Form>
  )
}
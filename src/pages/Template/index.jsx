import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { Form, Button, Col, Row, Typography, Checkbox } from 'antd'
import { CaretLeftFilled, SaveOutlined, PlusOutlined } from '@ant-design/icons'
import FormField from '../../components/FormField'
import { useTemplates, useScriptFile } from '../../utils/api'
import { VALIDATION_MESSAGES } from '../../consts'
import axios from '../../utils/axios'
import { sqlInsert, sqlUpdate } from '../../utils/sql'
import { php } from '@codemirror/lang-php'

const CodeMirror = lazy(() => import('@uiw/react-codemirror'))

export default function Template() {
  const [ form ] = Form.useForm()
  const { id } = useParams()
  const [ code, setCode ] = useState()
  const navigate = useNavigate()
  const template = useTemplates(id)
  const isNew = id === 'create'

  const onChange = useCallback(val => {
    setCode(val)
  }, [])

  useEffect(() => {
    setCode(template.data?.file)
  }, [template.data?.file])

  if (template.isLoading) return null

  return (
    <Form
      initialValues={template.data}
      layout='vertical'
      size='large'
      validateMessages={VALIDATION_MESSAGES}
      form={form}
      onFinish={async (values) => {
        if (!isNew) values.id = Number(id)
        values.file = code
        await axios.postWithAuth('/data', { data: JSON.stringify({ script_templates: [ values ] }) })
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
          <Row gutter={10} align='bottom'>
            <Col span={6}>
              <FormField
                name='ru'
                label='Название'
              />
            </Col>
            <Col span={6}>
              <FormField
                name='var'
                label='var'
              />
            </Col>
            <Col span={24} style={{ marginTop: 20 }}>
              <Suspense>
                <CodeMirror
                  height='400px'
                  value={template.data?.file}
                  extensions={[php()]}
                  onChange={onChange}
                />
              </Suspense>
            </Col>
          </Row>
        </Col>
      </Row>
      
    </Form>
  )
}
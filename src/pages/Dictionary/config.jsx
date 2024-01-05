import { useEffect, useState } from 'react'
import { Row, Col, Typography, Form, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { LoadingOutlined } from '@ant-design/icons'
import FormField from '../../components/FormField'
import { useDictionary } from '../../utils/api'
import axios from '../../utils/axios'
import { sqlInsert, sqlUpdate } from '../../utils/sql'
import { VALIDATION_MESSAGES } from '../../consts'

export default function ConfigForm() {
  const [ isUpdating, setIsUpdating ] = useState(false)
  const [ messageApi, contextHolder ] = message.useMessage()
  const [ form ] = Form.useForm()
  const name = 'config'
  const navigate = useNavigate()
  const { data = { list: [] }, isLoading, isFetching } = useDictionary(name)
  const initialValues = data.list[0]
  const id = initialValues?.id
  const isNew = !isLoading && !id

  useEffect(() => {
    if (!isFetching) {
      form.setFieldsValue(initialValues)
    }
  }, [isFetching, initialValues])

  return isLoading ?
    <Row style={{ height: 'calc(100vh - 64px)' }} justify='center' align='middle'>
      <LoadingOutlined style={{ fontSize: '64px' }} /> : 
    </Row> :
    <Form
      validateMessages={VALIDATION_MESSAGES}
      layout='vertical'
      size='large'
      initialValues={initialValues}
      form={form}
      onFinish={async (values) => {
        setIsUpdating(true)
        if (isNew) {
          await axios.postWithAuth('/query/insert', { sql: sqlInsert('sprset', { status: 0, tip: name, pole: JSON.stringify(values) }) })
        } else {
          await axios.postWithAuth('/query/update', { sql: sqlUpdate('sprset', { pole: JSON.stringify(values) }, `id=${id}`) })
        }
        setIsUpdating(false)
        messageApi.open({
          type: 'success',
          content: 'Данные успешно сохранены',
        })
      }}
    >
      {contextHolder}
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>Параметры учета</Typography.Title>
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
            <Col span={6}>
              <FormField
                type='number'
                label='Количество дней бесплатного хранения'
                name='free_days'
                width='100%'
                rules={[{ required: true }]}
              />
            </Col>
          </Row>
        </Col>
      </Row>
    </Form>
}
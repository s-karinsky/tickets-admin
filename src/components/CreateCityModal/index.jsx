import { Modal, Form, Button, Select, Input } from 'antd'
import axios from '../../utils/axios'
import { sqlInsert } from '../../utils/sql'

export default function CreateCityModal({
  onCancel = () => {},
  countries,
  initialValues,
  isOpen
}) {
  const [ form ] = Form.useForm()

  return isOpen ?
    <Modal
      title='Добавить город'
      onOk={() => {
        form.submit()
      }}
      onCancel={onCancel}
      open
    >
      <Form
        initialValues={initialValues}
        layout='vertical'
        size='large'
        onFinish={async (values) => {
          const resp = await axios.postWithAuth('/query/insert', {
            sql: sqlInsert('city', values)
          })
        }}
        form={form}
        footer={[
          <Button
            key='1'
            onClick={() => onCancel()}
            danger
          >
            Отмена
          </Button>,
          <Button
            key='2'
            type='primary'
            style={{ backgroundColor: 'rgb(0, 150, 80)' }}
            onClick={() => {
              form.submit()
            }}
          >
            Сохранить
          </Button>,
        ]}
      >
        <Form.Item
          name='country'
          label='Страна'
        >
          <Select
            options={countries}
          />
        </Form.Item>
        <Form.Item
          name='name_ru'
          label='Город'
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal> :
  null
}
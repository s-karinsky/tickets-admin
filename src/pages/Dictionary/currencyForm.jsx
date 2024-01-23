import { Modal, Form } from 'antd'
import FormField from '../../components/FormField'
import { VALIDATION_MESSAGES } from '../../consts'

export default function CurrencyForm({
  name,
  onSubmit = () => {},
  onCancel = () => {},
  ...initialValues
}) {
  const [ form ] = Form.useForm()

  return (
    <Modal
      width={400}
      title={`Курс валюты ${name}`}
      onOk={() => form.submit()}
      onCancel={onCancel}
      open
    >
      <Form
        form={form}
        initialValues={initialValues}
        size='large'
        onFinish={onSubmit}
        validateMessages={VALIDATION_MESSAGES}
      >
        <FormField
          name='date'
          type='date'
          label='Дата'
          rules={[ { required: true } ]}
          style={{ marginBottom: 20, width: '100%' }}
        />
        <FormField
          name='rate'
          type='number'
          label='Курс'
          rules={[ { required: true } ]}
          width='100%'
        />
      </Form>
    </Modal>
  )
}
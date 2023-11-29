import { Form, Input, InputNumber, DatePicker, Select } from 'antd'

export default function FormField({
  label,
  name,
  type,
  isEdit = true,
  text,
  rules,
  ...rest
}) {
  let child = null

  switch (type) {
    case 'date':
      child = isEdit ?
        <DatePicker format='DD.MM.YYYY' {...rest} /> :
        <div style={{ fontSize: 16, fontWeight: 'normal', ...rest.style }}>
          {text}
        </div>
      break

    case 'select':
      child = isEdit ?
        <Select
          {...rest}
        /> :
        <div style={{ fontSize: 16, fontWeight: 'normal', ...rest.style }}>
          {text}
        </div>
      break

    case 'number':
      child = <InputNumber
        {...rest}
        bordered={isEdit}
        readOnly={!isEdit}
      />
      break

    case 'textarea':
      child = isEdit ?
        <Input.TextArea {...rest} /> :
        <div style={{ fontSize: 16, fontWeight: 'normal', ...rest.style }}>
          {text}
        </div>
      break
  
    default:
      child = <Input
        {...rest}
        bordered={isEdit}
        readOnly={!isEdit}
      />
      break
  }

  return (
    <Form.Item
      label={label}
      name={name}
      style={{ fontWeight: 'bold', width: rest.style?.width }}
      rules={isEdit ? rules : undefined}
    >
      {child}
    </Form.Item>
  )
}
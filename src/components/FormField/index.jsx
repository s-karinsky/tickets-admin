import { Form, Input, InputNumber, DatePicker, Select } from 'antd'
import { MaskedInput } from 'antd-mask-input'

export default function FormField({
  label,
  name,
  type,
  isEdit = true,
  text,
  rules,
  width,
  labelType,
  mask,
  ...rest
}) {
  let child = null

  if (width) {
    rest = {
      style: {
        width,
        ...rest?.style
      },
      ...rest
    }
  }

  const renderWithBorders = (child, styles) =>
    <div
      style={{
        fontSize: 16,
        fontWeight: 'normal',
        border: '1px solid rgb(217, 217, 217)',
        lineHeight: '38px',
        height: '38px',
        padding: '0 11px',
        borderRadius: 6,
        ...styles,
        ...rest.style
      }}
    >{child}</div>

  switch (type) {
    case 'date':
      child = isEdit ?
        <DatePicker
          format='DD.MM.YYYY'
          placeholder='Выберите дату'
          {...rest}
        /> :
        renderWithBorders(text, { textAlign: 'center' })
      break

    case 'select':
      child = isEdit ?
        <Select
          {...rest}
        /> :
        renderWithBorders(text)
      break

    case 'number':
      child = <InputNumber
        {...rest}
        decimalSeparator=','
        readOnly={!isEdit}
      />
      break

    case 'textarea':
      child = isEdit ?
        <Input.TextArea {...rest} autoSize /> :
        renderWithBorders(text)
      break
  
    default:
      child = mask ?
        <MaskedInput
          {...rest}
          readOnly={!isEdit}
          mask={mask}
        />
        : <Input
          {...rest}
          readOnly={!isEdit}
        />
      break
  }

  if (labelType === 'sum') {
    label = <><sup>∑</sup>&nbsp;{label}</>
  } else if (labelType === 'calc') {
    label = <><sup>ƒ</sup>&nbsp;{label}</>
  }

  return (
    <Form.Item
      label={label}
      name={name}
      style={{ fontWeight: 'bold', width }}
      rules={isEdit ? rules : undefined}
    >
      {child}
    </Form.Item>
  )
}
import { useMemo } from 'react'
import { Form, Select } from 'antd'
import { useUsersWithRole } from '../../utils/api'
import { getSurnameWithInitials } from '../../utils/utils'

export default function SelectUser({ role, ids = [], placeholder, clearable, onChange, ...rest }) {
  const users = useUsersWithRole(role)
  const options = useMemo(() => {
    if (!Array.isArray(users.data)) return []
    let data = users.data
    if (ids.length > 0) {
      data = data.filter(item => ids.includes(item.id_user))
    }
    return data.map(item => ({
      value: item.id_user,
      label: `${item.json?.code} (${getSurnameWithInitials(item.family, item.middle, item.name)})`
    }))
  }, [users.data])

  return (
    <Form.Item
      style={{ fontWeight: 'bold' }}
      {...rest}
    >
      <Select
        options={options}
        filterOption={(inputValue, option) => {
          return String(option.label).toLowerCase().includes(inputValue.toLowerCase())
        }}
        placeholder={placeholder}
        onChange={!onChange ? undefined : onChange}
        allowClear={clearable}
        showSearch
      />
    </Form.Item>
  )
}
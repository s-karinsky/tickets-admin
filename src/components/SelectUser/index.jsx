import { useMemo } from 'react'
import { Form, Select } from 'antd'
import { useUsersWithRole } from '../../utils/api'
import { getSurnameWithInitials } from '../../utils/utils'

export default function SelectUser({ role, ...rest }) {
  const users = useUsersWithRole(role)
  const options = useMemo(() => {
    if (!Array.isArray(users.data)) return []
    return users.data.map(item => ({
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
        showSearch
      />
    </Form.Item>
  )
}
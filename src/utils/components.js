import { SearchOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import ColumnFilter from '../components/ColumnFilter'

export const getColumnSearchProps = (dataIndex, { options = [], type } = {}) => ({
  filterDropdown: props => (
    <ColumnFilter
      {...props}
      type={type || (options.length > 0 ? 'select' : 'input')}
      options={options}
      showSearch
    />
  ),
  filterIcon: (filtered) => (
    <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
  ),
  onFilter: (value, record) => {
    const dataValue = (typeof dataIndex === 'function' ? dataIndex(record) : record[dataIndex]) || ''
    if (type === 'date') {
      return (dayjs(dataValue).isSame(value[0], 'day') || dayjs(dataValue).isAfter(value[0], 'day')) &&
        (dayjs(dataValue).isSame(value[1], 'day') || dayjs(dataValue).isBefore(value[1], 'day'))
    }
    if (type === 'number') {
      let result = true
      if (value[0]) {
        result = result && parseInt(dataValue) >= value[0]
      }
      if (value[1]) {
        result = result && parseInt(dataValue) <= value[1]
      }
      return result
    }
    return dataValue.toString().toLowerCase().includes(String(value).toLowerCase())
  }
})
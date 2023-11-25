import { useMemo } from 'react'
import { Button, Calendar, Input, InputNumber, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

export default function ColumnFilter({
  placeholder = 'Search',
  type = 'input',
  showSearch,
  options = [],
  setSelectedKeys,
  selectedKeys,
  confirm,
  clearFilters,
  close,
}) {
  const isInput = type === 'input'
  const isSelect = type === 'select'
  const isDate = type === 'date'
  const isNumber = type === 'number'
  const selectOptions = useMemo(() => {
    if (!Array.isArray(options)) return
    return options.map((item) =>
      item.value !== undefined ? item : { value: item, label: item }
    )
  }, [options])

  const selectValue = (selectOptions.find(item => item.value === selectedKeys[0]) || {}).label

  return (
    <div style={{ padding: 10 }} onKeyDown={(e) => e.stopPropagation()}>
      <div style={{ minWidth: 200, maxWidth: 300 }}>
        {isInput && (
          <Input
            placeholder={placeholder}
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(
                e.target.value ? [e.target.value] : []
              )
            }
            onPressEnter={() => confirm()}
            style={{ width: '100%', marginBottom: 8 }}
          />
        )}
        {isNumber && (
          <InputNumber
            placeholder={placeholder}
            value={selectedKeys[0]}
            onChange={num => setSelectedKeys(num ? [num] : [])}
            onPressEnter={() => confirm()}
            style={{ width: '100%', marginBottom: 8 }}
          />
        )}
        {isSelect && (
          <Select
            placeholder={placeholder}
            value={selectValue}
            onChange={(value) =>
              setSelectedKeys(value !== undefined ? [String(value)] : [])
            }
            onSelect={() => confirm()}
            filterOption={(input, option) =>
              (option?.label ?? '')
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            options={selectOptions}
            showSearch={showSearch}
            style={{ width: '100%', marginBottom: 8 }}
          />
        )}
        {isDate && (
          <Calendar
            fullscreen={false}
            value={selectedKeys[0]}
            onChange={(date) => setSelectedKeys([date])}
          />
        )}
      </div>
      <div>
        {(isInput || isNumber || isDate) && (
          <Button
            type='primary'
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            size='small'
            style={{ width: '100%', marginBottom: 8 }}
          >
            Search
          </Button>
        )}
        <Button
          onClick={() => {
            clearFilters && clearFilters()
            confirm()
          }}
          size='small'
          style={{ width: '100%' }}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}

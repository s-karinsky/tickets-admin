import { useMemo, useState, useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Form, Input, Row, Col, Select } from 'antd'
import { pickBy, transform, keys } from 'lodash'
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons'
import { diff } from 'deep-object-diff'
import { getLang, getLangValue, updateLang } from '../../redux/config'

const FIELD_NAME_MAP = {
  match_list_header: 'Match list header',
  filter_reset: 'Reset filter button text',
  tickets_in_stock: 'Tickets in stock filter text',
  filter_tournaments_placeholder: 'Filter default tournament text',
  filter_team_placeholder: 'Filter default team'
}

const FIELDS = [
  {
    key: 'match_list_header',
    title: 'Match list header'
  },
  {
    key: 'filter_reset',
    title: 'Reset filter button text'
  },
  {
    key: 'tickets_in_stock',
    title: 'Tickets in stock filter text'
  },
  {
    key: 'filter_tournaments_placeholder',
    title: 'Filter default tournament text'
  },
  {
    key: 'filter_team_placeholder',
    title: 'Filter default team'
  }
]

export default function PageTranslations() {
  const [ isSaved, setIsSaved ] = useState(true)
  const [ selectedVar, setSelectedVar ] = useState()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isUpdating = useSelector(state => state.config.isUpdating)
  const langs = useSelector(getLang)
  const langValues = useSelector(getLangValue)

  useEffect(() => {
    if (!isUpdating) {
      setIsSaved(true)
    }
  }, [isUpdating])

  const handleFinish = useCallback(values => {
    const changed = transform(
      pickBy(diff(langValues, values), value => value),
      (acc, item, key) => {
        const newItem = pickBy(item, value => value)
        if (keys(newItem).length) acc[key] = newItem
        return acc
      },
    {})
    dispatch(updateLang(changed))
  }, [langValues])

  const varsOptions = Object.keys(langValues).map(value => ({
    value,
    label: FIELD_NAME_MAP[value] || value
  }))

  let saveButtonIcon
  if (isUpdating) saveButtonIcon = <LoadingOutlined />
  if (isSaved) saveButtonIcon = <CheckOutlined />

  return (
    <Form
      layout='vertical'
      onFinish={handleFinish}
      initialValues={langValues}
      onValuesChange={() => setIsSaved(false)}
    >
      <Row
        style={{
          borderBottom: '1px solid #ccc',
          padding: '10px'
        }}
      >
        <Button
          type='primary'
          htmlType='submit'
          disabled={isUpdating || isSaved}
          icon={saveButtonIcon}
        >
          {isSaved ? 'Saved' : 'Save'}
        </Button>
      </Row>
      <Row style={{ margin: '20px 0 0 30px' }}>
        <Col span={23}>
          <Select
            disabled={isUpdating}
            options={varsOptions}
            style={{ width: '100%' }}
            placeholder='Select variable'
            onSelect={value => {
              setSelectedVar(value)
              setIsSaved(true)
            }}
            showSearch
          >

          </Select>
        </Col>
      </Row>
      {!!selectedVar && !!langValues[selectedVar] && <Row style={{ margin: '20px 0 0 30px' }}>
        {langs.map((lang, i) => (
          <Col span={5} offset={i ? 1 : 0} key={lang.id}>
            <Form.Item
              label={lang.native}
              name={[selectedVar, lang.id]}
            >
              <Input />
            </Form.Item>
          </Col>
        ))}
      </Row>}
    </Form>
  )
}
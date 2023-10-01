import { useMemo, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, Form, Input, Row, Col } from 'antd'
import { CheckOutlined, LoadingOutlined } from '@ant-design/icons'
import { diff } from 'deep-object-diff'
import { getLang, getLangValue, updateLang } from '../../redux/config'

const LANG_FIELDS_BY_PAGE = {
  home: [
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
}

export default function PageContent() {
  const { page } = useParams()
  const [ isSaved, setIsSaved ] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const isUpdating = useSelector(state => state.config.isUpdating)
  const langs = useSelector(getLang)
  const langValues = useSelector(getLangValue)

  const fields = LANG_FIELDS_BY_PAGE[page]
  const initialValues = useMemo(() =>
    (fields || []).reduce((acc, field) => ({ ...acc, [field.key]: langValues[field.key] }), {})
  , [langValues, fields])

  useEffect(() => {
    if (!isUpdating) {
      setIsSaved(true)
    }
  }, [isUpdating])

  if (!fields) {
    return (
      <div>Page not found</div>
    )
  }

  let saveButtonIcon
  if (isUpdating) saveButtonIcon = <LoadingOutlined />
  if (isSaved) saveButtonIcon = <CheckOutlined />

  return (
    <Form
      layout='vertical'
      onFinish={values => {
        const changed = diff(initialValues, values)
        const update = Object.keys(changed).reduce((res, name) => {
          const vals = changed[name]
          const filtered = Object.keys(vals).filter(langId => vals[langId] !== undefined).reduce((acc, langId) => ({
            ...acc,
            [langId]: vals[langId]
          }), {})
          return Object.values(filtered).length > 0 ? {
            ...res,
            [name]: filtered
          } : res
        }, {})
        dispatch(updateLang(update))
      }}
      initialValues={initialValues}
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
      {fields.map(field => (
        <div key={field.key} style={{ margin: '20px 0 0 30px' }}>
          <b>{field.title}</b>
          <Row style={{ marginTop: 10 }}>
            {langs.map((lang, i) => (
              <Col span={5} offset={i ? 1 : 0} key={lang.id}>
                <Form.Item
                  label={lang.native}
                  name={[field.key, lang.id]}
                >
                  <Input />
                </Form.Item>
              </Col>
            ))}
          </Row>
        </div>
      ))}
    </Form>
  )
}
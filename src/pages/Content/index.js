import { useMemo, useState, useCallback } from 'react'
import { Col, Row, Button, Form, Select, Input } from 'antd'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import ReactQuill from 'react-quill'
import { forEach } from 'lodash'
import { getLang, getLangValue, updateLang } from '../../redux/config'
import 'react-quill/dist/quill.snow.css'

export default function PageContent() {
  const { page } = useParams()
  const [ activeLang, setActiveLang ] = useState('1')
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const contentKey = `page_content_${page}`
  const titleKey = `page_title_${page}`
  const langs = useSelector(getLang)
  const content = useSelector(state => getLangValue(state, contentKey))
  const title = useSelector(state => getLangValue(state, titleKey))
  const isUpdating = useSelector(state => state.config.isUpdating)

  const langsOptions = useMemo(() => langs.map(lang => ({
    label: lang.native,
    value: lang.id
  })), [langs])

  const handleSubmit = useCallback(values => {
    const obj = {}
    forEach(values, (value, lang) => {
      if (value.title !== undefined)
        obj[titleKey] = { ...obj[titleKey], [lang]: value.title }

      if (value.content !== undefined)
        obj[contentKey] = { ...obj[titleKey], [lang]: value.content }
    })
    dispatch(updateLang(obj))
  }, [contentKey, titleKey])

  return (
    <Form
      layout='vertical'
      initialValues={{ title, content }}
      onFinish={handleSubmit}
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
          disabled={isUpdating}
        >
          Save
        </Button>
      </Row>
      <Row style={{ margin: '20px 0' }}>
        <Col span={22} offset={1}>
          <Select
            style={{ width: '100%' }}
            options={langsOptions}
            value={activeLang}
            onChange={setActiveLang}
          />
        </Col>
      </Row>
      {langsOptions.map(lang => (
        <Row
          key={lang.value}
          style={{
            display: lang.value === activeLang ? 'block' : 'none',
            margin: '20px 0'
          }}
        >
          <Col span={22} offset={1}>
            <Form.Item
              label='Page title'
              name={['title', lang.value]}
            >
              <Input
              />
            </Form.Item>
          </Col>
          <Col span={22} offset={1}>
            <Form.Item
              label='Page content'
              name={['content', lang.value]}
            >
              <Input.TextArea
              />
              {/* <ReactQuill
                style={{ background: '#fff' }}
                theme='snow'
                defaultValue={content[lang.value]}
              /> */}
            </Form.Item>
          </Col>
        </Row>
      ))}
    </Form>
  )
}
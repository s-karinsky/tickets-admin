import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, useNavigate } from 'react-router-dom'
import { Col, Row, Form, Button, Select, Input } from 'antd'
import { CaretLeftFilled } from '@ant-design/icons'
import { fetchData, getTeam, postData } from '../../redux/data'
import { getCities, getCountries } from '../../redux/config'

const getOptions = obj => Object.values(obj)
  .map(item => ({ label: item.en, value: item.id }))
  .sort((item1, item2) => item1.label > item2.label ? 1 : -1)

export default function PageTeam() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { id } = useParams()
  const isNew = id === 'create'
  const isSubmitting = useSelector(state => state.data.isSubmitting)
  const isLoaded = useSelector(state => state.data.isLoaded)
  const isLoading = useSelector(state => state.data.isLoading)
  const stadiums = useSelector(state => state.data.stadiums)
  const cities = useSelector(getCities)
  const countries = useSelector(getCountries)
  const team = useSelector(state => getTeam(state, id))

  const countriesOptions = useMemo(() => getOptions(countries), [countries])
  const citiesOptions = useMemo(() => getOptions(cities), [cities])
  const stadiumsOptions = useMemo(() => getOptions(stadiums), [stadiums])

  useEffect(() => {
    if (!isLoaded && !isLoading) {
      dispatch(fetchData())
    }
  }, [isLoaded, isLoading])

  if (!team && !isNew) {
    return null
  }

  const initialValues = !team ? {} : {
    name: team.en,
    country: team.country,
    city: team.city,
    logo: team.logo,
    stadium: team.stadium?.id
  }

  return (
    <Form
      layout='vertical'
      onFinish={values => {
        const { name, country, city, stadium } = values
        const team = { en: name, country, city, stadium }
        if (!isNew) team.id = id
        dispatch(postData({ teams: [team] })).then(() => navigate('/teams'))
      }}
      initialValues={initialValues}
    >
      <Row
        style={{
          borderBottom: '1px solid #ccc',
          padding: '10px'
        }}
      >
        <Button
          icon={<CaretLeftFilled />}
          style={{ marginRight: '10px' }}
          onClick={() => navigate('/teams')}
        >
          Back
        </Button>
        <Button
          type='primary'
          htmlType='submit'
          loading={isSubmitting}
        >
          {isNew ? 'Create' : 'Save'}
        </Button>
      </Row>
      <Row style={{ margin: '20px 20px 0 20px' }}>
        <Col
          span={12}
          style={{ padding: '0 10px 0 0' }}
        >
          <Form.Item
            label='Name'
            name='name'
            rules={[{ required: true, message: 'Please input team name' }]}
          >
            <Input
              size='large'
              placeholder='Name'
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Col>
        <Col
          span={12}
          style={{ padding: '0 0 0 10px' }}
        >
          <Form.Item
            label='Stadium'
            name='stadium'
          >
            <Select
              size='large'
              placeholder='Stadium'
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={stadiumsOptions}
              style={{ width: '100%' }}
              showSearch
            />
          </Form.Item>
        </Col>
      </Row>
      <Row style={{ margin: '20px 20px 0 20px' }}>
        <Col
          span={12}
          style={{ padding: '0 10px 0 0' }}
        >
          <Form.Item
            label='Country'
            name='country'
            rules={[{ required: true, message: 'Please input team country' }]}
          >
            <Select
              size='large'
              placeholder='Country'
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={countriesOptions}
              style={{ width: '100%' }}
              showSearch
            />
          </Form.Item>
        </Col>
        <Col
          span={12}
          style={{ padding: '0 0 0 10px' }}
        >
          <Form.Item
            label='City'
            name='city'
          >
            <Select
              size='large'
              placeholder='City'
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={citiesOptions}
              style={{ width: '100%' }}
              showSearch
            />
          </Form.Item>
        </Col>
      </Row>
    </Form>
  )
}
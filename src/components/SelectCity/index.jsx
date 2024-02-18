import { useState, useEffect } from 'react'
import { Divider, Button, Col } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import FormField from '../FormField'
import CreateCityModal from '../CreateCityModal'
import { useCountries, useCities } from '../../utils/api'
import { filterOption } from '../../utils/utils'

export default function SelectCity({
  nameCity = 'city',
  nameCountry = 'country',
  showErrorMessage = () => {},
  defaultCountry,
  span = 8,
  form
}) {
  const [ country, setCountry ] = useState(defaultCountry)
  const [ isAddCity, setIsAddCity ] = useState(false)
  const countries = useCountries()
  const cities = useCities(country)

  return (
    <>
      <Col span={span[0] || span}>
        <FormField
          type='select'
          name={nameCountry}
          label='Страна'
          options={countries.data?.list || []}
          onChange={country => {
            setCountry(country)
            if (form) {
              form.setFieldValue(nameCity)
            }
          }}
        />
      </Col>
      <Col span={span[1] || span}>
        <FormField
          type='select'
          name={nameCity}
          label='Город'
          options={cities.data?.list || []}
          dropdownRender={(menu) => (
            <>
              {menu}
              <Divider style={{ margin: '8px 0' }} />
              <Button
                type='text'
                icon={<PlusOutlined />}
                onClick={() => setIsAddCity(true)}
                block
              >
                Добавить город
              </Button>
            </>
          )}
          filterOption={filterOption}
          showSearch
        />
      </Col>
      <CreateCityModal
        isOpen={isAddCity}
        onOk={values => {
          if (values.country !== country) {
            setCountry(values.country)
            if (form) {
              form.setFieldValue(nameCountry, values.country)
              form.setFieldValue(nameCity, values.id)
            }
          } else {
            cities.refetch()
          }
        }}
        onFail={data => showErrorMessage(data.message)}
        onClose={() => setIsAddCity(false)}
        initialValues={{
          country
        }}
        countries={countries.data?.list || []}
      />
    </>
  )
}
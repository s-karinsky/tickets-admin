import { useState, useEffect } from 'react'
import { Col } from 'antd'
import { useDictionary } from '../../utils/api'
import { numberFormatter } from '../../utils/utils'
import FormField from '../FormField'

export default function SelectRate({
  nameRate = 'rate',
  nameCategory = 'tarif',
  span = 4,
  rulesRate,
  rulesCategory,
  defaultRate,
  defaultCategory,
  onChange = () => {},
  showPrice = false,
  form,
  isEdit
}) {
  const [ rate, setRate ] = useState(defaultRate)
  const [ category, setCategory ] = useState(defaultCategory)
  const [ priceType, setPriceType ] = useState()
  const tarifs = useDictionary('rates')
  const categories = useDictionary('prod-cat', { id_ref: rate }, { enabled: !!rate })

  useEffect(() => {
    const item = (categories.data?.map || {})[category]
    if (!item) return
    setPriceType(item.price_type || '1')
    form.setFieldsValue({ pay_kg: item.price_kg })
    form.setFieldsValue({ pay_type: item.pay_type })
  }, [category, categories])

  return (
    <>
      <Col span={span[0] || span}>
        <FormField
          type='select'
          label='Тариф'
          name={nameRate}
          options={tarifs.data?.list || []}
          text={(tarifs.data?.map || {})[rate]?.label}
          isEdit={isEdit}
          rules={rulesRate}
          onChange={value => setRate(value)}
          showSearch
        />
      </Col>
      <Col span={span[1] || span}>
        <FormField
          type='select'
          label='Категория товаров'
          name={nameCategory}
          options={categories.data?.list || []}
          text={(categories.data?.map || {})[category]?.label}
          isEdit={isEdit}
          rules={rulesCategory}
          onChange={(value, item) => {
            setCategory(value)
            onChange(item)
          }}
          showSearch
        />
      </Col>
      {showPrice && <Col span={span[2] || span[1] || span}>
        <FormField
          type='number'
          label={`Цена за 1 ${priceType === '1' ? 'кг' : 'ед'}`}
          name='pay_kg'
          addonAfter='$'
          isEdit={isEdit}
          formatter={numberFormatter(2)}
        />
      </Col>}
    </>
  )
}
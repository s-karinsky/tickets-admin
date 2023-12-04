import { useState } from 'react'
import { Row, Col, Typography, Modal, Button, Form, Checkbox, Tabs } from 'antd'
import dayjs from 'dayjs'
import { PropertyGap } from '../../pages/Sendings'
import FormField from '../../components/FormField'
import { getCount, createDataset, updateDatasetById } from '../../utils/api'
import { required, numberRange } from '../../utils/validationRules'
const { Title } = Typography

export const CreateProductModal = ({ isModalOpen, handleCancel, placeId, userId, maxNum, isSumDisabled, product = {} }) => {
  const [ form ] = Form.useForm()
  const isNew = product === true
  const [ isEdit, setIsEdit ] = useState(isNew)
  const initialValues = {
    number: maxNum + 1,
    ...product,
    cert_start_date: product.cert_start_date ? dayjs(product.cert_start_date) : undefined,
    cert_end_date: product.cert_end_date ? dayjs(product.cert_end_date) : undefined
  }
  return (
    <Modal
      width={700}
      style={{ top: 20 }}
      title={
        <Row>
          <Col>
            <Title
              level={2}
              style={{
                fontWeight: '700',
                marginBottom: '0',
                marginTop: 0,
              }}
            >
              {product === true ? 'Создать товар' : (isEdit ? 'Редактировать товар' : 'Просмотр товара')}
            </Title>
          </Col>
          {!isEdit && <Col>
            <Button style={{ margin: '6px 0 0 20px' }} onClick={() => setIsEdit(true)}>
              Редактировать
            </Button>
          </Col>}
        </Row>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={isEdit ? [
        <Button
          key='1'
          onClick={() => handleCancel()}
          danger
        >
          Отмена
        </Button>,
        <Button
          key='2'
          type='primary'
          style={{ backgroundColor: 'rgb(0, 150, 80)' }}
          onClick={() => {
            form.submit()
          }}
        >
          Сохранить
        </Button>,
      ] : null}
    >
      <Form
        style={{
          display: 'flex',
          gap: `${PropertyGap}px`,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
        }}
        layout='vertical'
        form={form}
        initialValues={initialValues}
        onFinish={async (values) => {
          if (product === true) {
            const params = {
              tip: 'product',
              id_ref: placeId,
              ref_tip: 'place',
              pole: JSON.stringify({ ...values, number: maxNum + 1 }),
              creator_id: userId,
              editor_id: userId
            }
            await createDataset(params)
          } else {
            await updateDatasetById(product.id, { pole: JSON.stringify(values) })
          }
          handleCancel()
        }}
      >
        <FormField
          type='number'
          isEdit={isEdit}
          label='Номер'
          labelType='calc'
          name='number'
          width={100}
          rules={
            [
              ...required(),
              () => ({
                validator: async (_, id) => {
                  if (!isNew && parseInt(id) === parseInt(initialValues.number)) return Promise.resolve()
                  const count = await getCount('dataset', `JSON_EXTRACT(pole,'$.number')=${id}`)
                  return count > 0 ? Promise.reject(new Error('Отправка с таким номером уже существует')) : Promise.resolve()
                },
              })
            ]
          }
          disabled={isEdit}
        />
        <FormField
          width={260}
          isEdit={isEdit}
          label='Наименование'
          name='name'
          rules={required()}
        />
        <FormField
          width={250}
          isEdit={isEdit}
          label='Марка'
          name='label'
        />
        <FormField
          width={150}
          isEdit={isEdit}
          label='Артикул'
          name='article'
        />
        <FormField
          width={150}
          isEdit={isEdit}
          label='Цвет'
          name='color'
        />
        <FormField
          width={150}
          isEdit={isEdit}
          label='Размер'
          name='size'
        />
        <FormField
          width={150}
          isEdit={isEdit}
          type='number'
          label='Вес нетто'
          name='net_weight'
          addonAfter={isEdit && 'кг'}
          rules={[...required(), ...numberRange({ min: 1, max: 99999 })]}
          formatter={(val) => Number(val).toFixed(3)}
        />
        <div style={{ flexBasis: '100%' }} />
        <Tabs
          size='small'
          style={{ flexBasis: '100%' }}
          defaultActiveKey='1'
          items={[
            {
              key: '1',
              label: 'Одежда',
              children: 
                <FormField
                  isEdit={isEdit}
                  label='Состав/материал'
                  name='material'
                />
            },
            {
              key: '2',
              label: 'Обувь',
              children: <div style={{ display: 'flex', gap: 10 }}>
                <FormField
                  isEdit={isEdit}
                  label='Верх'
                  name='shoes_top'
                />
                <FormField
                  isEdit={isEdit}
                  label='Подкладка'
                  name='shoes_und'
                />
                <FormField
                  isEdit={isEdit}
                  label='Низ'
                  name='shoes_bottom'
                />
              </div>
            }
          ]}
        />
        <div style={{ flexBasis: '100%' }} />
        <fieldset style={{ display: 'flex', gap: 10, margin: '0 -10px' }}>
          <legend>Сертификат/Декларация о соответствии</legend>
          <FormField
            width={210}
            isEdit={isEdit}
            label='Номер'
            name='cert_number'
          />
          <FormField
            width={210}
            isEdit={isEdit}
            type='date'
            label='Дата начала'
            name='cert_start_date'
          />
          <FormField
            width={210}
            isEdit={isEdit}
            type='date'
            label='Дата окончания'
            name='cert_end_date'
          />
        </fieldset>
        <FormField
          width={150}
          isEdit={isEdit}
          type='number'
          label='Количество'
          name='count'
          rules={[...required(), ...numberRange({ min: 1, max: 99999 })]}
        />
        <FormField
          width={150}
          isEdit={isEdit}
          type='number'
          label='Цена'
          labelType={isSumDisabled && 'calc'}
          name='price'
          addonAfter={isEdit && '$'}
          disabled={isSumDisabled}
          formatter={(val) => Number(val).toFixed(2)}
        />
        <FormField
          width={150}
          isEdit={isEdit}
          type='number'
          label='Сумма'
          labelType={isSumDisabled && 'calc'}
          name='sum'
          addonAfter={isEdit && '$'}
          disabled={isSumDisabled}
          formatter={(val) => Number(val).toFixed(2)}
        />
        <Form.Item
          width={150}
          style={{ alignSelf: 'flex-end' }}
          name='mark'
          valuePropName='checked'
        >
          <Checkbox disabled={!isEdit}>Маркировка ЧЗ</Checkbox>
        </Form.Item>
        <div style={{ flexBasis: '100%' }} />
        <div style={{ flexGrow: 1 }}>
          <FormField
            isEdit={isEdit}
            type='textarea'
            label='Примечание'
            name='note'
          />
        </div>
      </Form>
    </Modal>
  )
}
export default CreateProductModal

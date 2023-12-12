import { useState } from 'react'
import { Row, Col, Typography, Modal, Button, Form, Checkbox, Tabs } from 'antd'
import dayjs from 'dayjs'
import { PropertyGap } from '../../pages/Sendings'
import FormField from '../../components/FormField'
import { getCount, createDataset, updateDatasetById } from '../../utils/api'
import { required, numberRange } from '../../utils/validationRules'
const { Title } = Typography

export const CreateProductModal = ({
  isModalOpen,
  handleCancel,
  placeId,
  userId,
  maxNum,
  isSumDisabled,
  isNotSending,
  product = {}
}) => {
  const [ form ] = Form.useForm()
  const isNew = product === true || !product.number
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
            <Button style={{ margin: '6px 0 0 20px' }} onClick={() => setIsEdit(true)} type='primary'>
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
          if (isNew) {
            const params = {
              tip: 'product',
              id_ref: placeId,
              ref_tip: 'place',
              pole: JSON.stringify({ ...values, number: maxNum + 1 }),
              creator_id: userId,
              editor_id: userId
            }
            const result = await createDataset(params)
            if (result.status === 'error') {
              Modal.error({
                title: 'Ошибка при сохранении',
                content: result.message
              })
            } else {
              handleCancel()
            }
          } else {
            const result = await updateDatasetById(product.id, { pole: JSON.stringify(values) })
            if (result.status === 'error') {
              Modal.error({
                title: 'Ошибка при сохранении',
                content: result.message
              })
            } else {
              handleCancel()
            }
          }
        }}
      >
        <FormField
          type='number'
          isEdit={isEdit}
          label='Номер'
          labelType='calc'
          name='number'
          width={80}
          rules={
            [
              ...required(),
              () => ({
                validator: async (_, id) => {
                  if (!isNew && parseInt(id) === parseInt(initialValues.number)) return Promise.resolve()
                  const count = await getCount('dataset', `JSON_EXTRACT(pole,'$.number')=${id} AND id_ref=${placeId} AND ref_tip='place' AND status=0`)
                  return count > 0 ? Promise.reject(new Error('Товар с таким номером уже существует')) : Promise.resolve()
                },
              })
            ]
          }
          disabled={!isNotSending && isEdit}
        />
        <FormField
          width={220}
          isEdit={isEdit}
          label='Наименование'
          name='name'
          rules={required()}
          disabled={!isNotSending}
        />
        <FormField
          width={180}
          isEdit={isEdit}
          label='Марка'
          name='label'
          disabled={!isNotSending}
        />
        <FormField
          width={120}
          isEdit={isEdit}
          label='Код ТН ВЭД ТС'
          name='tn_code'
          disabled={!isNotSending}
        />
        <FormField
          width={150}
          isEdit={isEdit}
          label='Артикул'
          name='article'
          disabled={!isNotSending}
        />
        <FormField
          width={150}
          isEdit={isEdit}
          label='Цвет'
          name='color'
          disabled={!isNotSending}
        />
        <FormField
          width={150}
          isEdit={isEdit}
          label='Размер'
          name='size'
          disabled={!isNotSending}
        />
        <FormField
          width={150}
          isEdit={isEdit}
          type='number'
          label='Вес нетто'
          name='net_weight'
          addonAfter={isEdit && 'кг'}
          rules={[...required(), ...numberRange({ min: 0.001, max: 99999 })]}
          formatter={(val) => Number(val).toFixed(3)}
          disabled={!isNotSending}
        />
        <div style={{ flexBasis: '100%' }} />
        <Form.Item style={{ flexBasis: '100%' }} dependencies={['material', 'shoes_top', 'shoes_und', 'shoes_bottom']}>
          {({ getFieldValue }) => {
            return (
              <Tabs
                size='small'
                style={{ flexBasis: '100%' }}
                defaultActiveKey='1'
                items={[
                  {
                    key: '1',
                    label: 'Одежда',
                    disabled: !!getFieldValue('shoes_top') || !!getFieldValue('shoes_und') || !!getFieldValue('shoes_bottom'),
                    children: 
                      <FormField
                        isEdit={isEdit}
                        label='Состав/материал'
                        name='material'
                        disabled={!isNotSending}
                      />
                  },
                  {
                    key: '2',
                    label: 'Обувь',
                    disabled: !!getFieldValue('material'),
                    children: <div style={{ display: 'flex', gap: 10 }}>
                      <FormField
                        width={205}
                        isEdit={isEdit}
                        label='Верх'
                        name='shoes_top'
                        disabled={!isNotSending}
                      />
                      <FormField
                        width={205}
                        isEdit={isEdit}
                        label='Подкладка'
                        name='shoes_und'
                        disabled={!isNotSending}
                      />
                      <FormField
                        width={205}
                        isEdit={isEdit}
                        label='Низ'
                        name='shoes_bottom'
                        disabled={!isNotSending}
                      />
                    </div>
                  }
                ]}
              />
            )
          }}
        </Form.Item>
        <div style={{ flexBasis: '100%' }} />
        <fieldset style={{ display: 'flex', gap: 10, margin: '0 -10px' }}>
          <legend>Сертификат/Декларация о соответствии</legend>
          <FormField
            width={210}
            isEdit={isEdit}
            label='Номер'
            name='cert_number'
            disabled={!isNotSending}
          />
          <FormField
            width={210}
            isEdit={isEdit}
            type='date'
            label='Дата начала'
            name='cert_start_date'
            disabled={!isNotSending}
          />
          <FormField
            width={210}
            isEdit={isEdit}
            type='date'
            label='Дата окончания'
            name='cert_end_date'
            disabled={!isNotSending}
          />
        </fieldset>
        <FormField
          width={150}
          isEdit={isEdit}
          type='number'
          label='Количество'
          name='count'
          rules={[...required(), ...numberRange({ min: 1, max: 99999 })]}
          disabled={!isNotSending}
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
          <Checkbox disabled={!isNotSending || !isEdit}>Маркировка ЧЗ</Checkbox>
        </Form.Item>
        <div style={{ flexBasis: '100%' }} />
        <div style={{ flexGrow: 1 }}>
          <FormField
            isEdit={isEdit}
            type='textarea'
            label='Примечание'
            name='note'
            disabled={!isNotSending}
          />
        </div>
      </Form>
    </Modal>
  )
}
export default CreateProductModal

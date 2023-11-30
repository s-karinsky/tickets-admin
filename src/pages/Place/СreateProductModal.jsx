import { useState } from 'react'
import { Row, Col, Typography, Modal, Button, Form, Checkbox } from 'antd'
import dayjs from 'dayjs'
import { PropertyGap } from '../../pages/Sendings'
import FormField from '../../components/FormField'
import { sqlInsert, sqlUpdate } from '../../utils/sql'
import axios from '../../utils/axios'
import { required, numberRange } from '../../utils/validationRules'
const { Title } = Typography

export const CreateProductModal = ({ isModalOpen, handleCancel, placeId, userId, maxNum, isSumDisabled, product = {} }) => {
  const [ form ] = Form.useForm()
  const [ isEdit, setIsEdit ] = useState(product === true)
  const initialValues = {
    number: maxNum + 1,
    ...product,
    cert_start_date: product.cert_start_date ? dayjs(product.cert_start_date) : undefined,
    cert_end_date: product.cert_end_date ? dayjs(product.cert_end_date) : undefined
  }
  return (
    <Modal
      width={700}
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
        size='large'
        layout='vertical'
        form={form}
        initialValues={initialValues}
        onFinish={async (values) => {
          if (product === true) {
            const params = {
              tip: 'product',
              id_ref: placeId,
              ref_tip: 'place',
              pole: JSON.stringify(values),
              creator_id: userId,
              editor_id: userId
            }
            await axios.postWithAuth('/query/insert', { sql: sqlInsert('dataset', params) })
          } else {
            const params = {
              pole: JSON.stringify(values)
            }
            await axios.postWithAuth('/query/update', { sql: sqlUpdate('dataset', params, `id=${product.id}`) })
          }
          handleCancel()
        }}
      >
        <FormField
          type='number'
          isEdit={isEdit}
          label='Номер'
          name='number'
          style={{ width: 204.4 }}
          rules={[...required(), numberRange({ min: maxNum + 1 })]}
        />
        <FormField
          isEdit={isEdit}
          label='Наименование'
          name='name'
          rules={required()}
        />
        <FormField
          isEdit={isEdit}
          label='Марка'
          name='label'
        />
        <FormField
          isEdit={isEdit}
          label='Артикул'
          name='article'
        />
        <FormField
          isEdit={isEdit}
          label='Цвет'
          name='color'
        />
        <FormField
          isEdit={isEdit}
          label='Размер'
          name='size'
        />
        <FormField
          isEdit={isEdit}
          label='Состав/материал'
          name='material'
        />
        <FormField
          isEdit={isEdit}
          type='number'
          label='Вес нетто'
          name='net_weight'
          addonAfter={isEdit && 'кг'}
          rules={[...required(), ...numberRange({ min: 1, max: 99999 })]}
          formatter={(val) => Number(val).toFixed(3)}
        />
        <div style={{ flexBasis: '100%' }} />
        <fieldset style={{ display: 'flex', gap: 10, margin: '0 -10px' }}>
          <legend>Обувь</legend>
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
        </fieldset>
        <div style={{ flexBasis: '100%' }} />
        <fieldset style={{ display: 'flex', gap: 10, margin: '0 -10px' }}>
          <legend>Сертификат/Декларация о соответствии</legend>
          <FormField
            isEdit={isEdit}
            label='Номер'
            name='cert_number'
          />
          <FormField
            isEdit={isEdit}
            type='date'
            label='Дата начала'
            name='cert_start_date'
            style={{ width: 204.4 }}
          />
          <FormField
            isEdit={isEdit}
            type='date'
            label='Дата окончания'
            name='cert_end_date'
            style={{ width: 204.4 }}
          />
        </fieldset>
        <FormField
          isEdit={isEdit}
          type='number'
          label='Количество'
          name='count'
          style={{ width: 204.4 }}
          rules={[...required(), ...numberRange({ min: 1, max: 99999 })]}
        />
        <FormField
          isEdit={isEdit}
          type='number'
          label='Цена'
          name='price'
          addonAfter={isEdit && '$'}
          style={{ width: 204.4 }}
          disabled={isSumDisabled}
          formatter={(val) => Number(val).toFixed(2)}
        />
        <FormField
          isEdit={isEdit}
          type='number'
          label='Сумма'
          name='sum'
          addonAfter={isEdit && '$'}
          style={{ width: 204.4 }}
          disabled={isSumDisabled}
          formatter={(val) => Number(val).toFixed(2)}
        />
        <div style={{ flexBasis: '100%' }} />
        <Form.Item
          name='mark'
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
            rows={4}
          />
        </div>
      </Form>
    </Modal>
  )
}
export default CreateProductModal

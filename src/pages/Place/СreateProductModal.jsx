import React from 'react'
import { Typography, Modal, DatePicker, Button, Form, Input, InputNumber, Checkbox } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { PropertyGap } from '../../pages/Sendings'
import { sqlInsert } from '../../utils/sql'
import axios from '../../utils/axios'
const { Title } = Typography

export const CreateProductModal = ({ isModalOpen, handleCancel, title, placeId, userId }) => {
  const [ form ] = Form.useForm()
  return (
    <Modal
      width={700}
      title={
        <Title
          level={2}
          style={{
            fontWeight: '700',
            marginBottom: '0',
            marginTop: 0,
          }}
        >
          {title}
        </Title>
      }
      open={isModalOpen}
      onCancel={handleCancel}
      footer={[
        <Button
          key='1'
          type='primary'
          style={{ backgroundColor: 'rgb(0, 150, 80)' }}
          onClick={() => {
            form.submit()
          }}
        >
          Сохранить
        </Button>,
      ]}
    >
      <Form
        style={{
          display: 'flex',
          gap: `${PropertyGap}px`,
          flexWrap: 'wrap',
          alignItems: 'flex-end',
        }}
        size='large'
        layout='vertical'
        form={form}
        onFinish={async (values) => {
          const params = {
            tip: 'product',
            id_ref: placeId,
            ref_tip: 'place',
            pole: JSON.stringify(values),
            creator_id: userId,
            editor_id: userId
          }
          await axios.postWithAuth('/query/insert', { sql: sqlInsert('dataset', params ) })
          handleCancel()
        }}
      >
        <Form.Item
          label='Наименование'
          name='name'
        >
          <Input

          />
        </Form.Item>
        <Form.Item
          label='Марка'
          name='label'
        >
          <Input

          />
        </Form.Item>
        <Form.Item
          label='Артикул'
          name='article'
        >
          <Input

          />
        </Form.Item>
        <Form.Item
          label='Цвет'
          name='color'
        >
          <Input

          />
        </Form.Item>
        <Form.Item
          label='Размер'
          name='size'
        >
          <Input

          />
        </Form.Item>
        <Form.Item
          label='Состав/материал'
          name='material'
        >
          <Input

          />
        </Form.Item>
        <div style={{ flexBasis: '100%' }} />
        <fieldset style={{ display: 'flex', gap: 10, margin: '0 -10px' }}>
          <legend>Обувь</legend>
          <Form.Item
            label='Верх'
            name='shoes_top'
          >
            <Input

            />
          </Form.Item>
          <Form.Item
            label='Подкладка'
            name='shoes_und'
          >
            <Input

            />
          </Form.Item>
          <Form.Item
            label='Низ'
            name='shoes_bottom'
          >
            <Input

            />
          </Form.Item>
        </fieldset>
        <div style={{ flexBasis: '100%' }} />
        <fieldset style={{ display: 'flex', gap: 10, margin: '0 -10px' }}>
          <legend>Сертификат/Декларация о соответствии</legend>
          <Form.Item
            label='Номер'
            name='cert_number'
          >
            <Input

            />
          </Form.Item>
          <Form.Item
            label='Дата начала'
            name='cert_start_date'
          >
            <DatePicker
              placeholder='Выберите дату'
              format='DD.MM.YYYY'
              style={{ width: 204.4 }}
            />
          </Form.Item>
          <Form.Item
            label='Дата окончания'
            name='cert_end_date'
          >
            <DatePicker
              placeholder='Выберите дату'
              format='DD.MM.YYYY'
              style={{ width: 204.4 }}
            />
          </Form.Item>
        </fieldset>
        <Form.Item
          label='Количество'
          name='count'
        >
          <InputNumber
            style={{ width: 204.4 }}
          />
        </Form.Item>
        <Form.Item
          label='Цена'
          name='price'
        >
          <InputNumber
            addonAfter='$'
            style={{ width: 204.4 }}
          />
        </Form.Item>
        <Form.Item
          label='Сумма'
          name='sum'
        >
          <InputNumber
            addonAfter='$'
            style={{ width: 204.4 }}
          />
        </Form.Item>
        <div style={{ flexBasis: '100%' }} />
        <Form.Item
          name='mark'
        >
          <Checkbox>Маркировка ЧЗ</Checkbox>
        </Form.Item>
        <div style={{ flexBasis: '100%' }} />
        <Form.Item
          label='Примечание'
          name='note'
          style={{ flexGrow: 1 }}
        >
          <TextArea
            rows={4}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
export default CreateProductModal

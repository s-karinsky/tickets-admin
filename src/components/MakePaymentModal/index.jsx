import { useState } from 'react'
import dayjs from 'dayjs'
import { DatePicker, Modal } from 'antd'

export default function MakePaymentModal({ title, onOk, onCancel }) {
  const [ doneDate, setDoneDate ] = useState(dayjs())

  return (
    <Modal
      title={title}
      onOk={() => onOk(doneDate)}
      onCancel={onCancel}
      okText='Провести'
      open
    >
      <DatePicker
        size='large'
        value={doneDate}
        onChange={val => setDoneDate(val)}
        format='DD.MM.YYYY'
        style={{ width: '100%' }}
      />
    </Modal>
  )
}
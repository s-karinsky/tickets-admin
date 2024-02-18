import { Modal } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { BsTrash } from 'react-icons/bs'

export default function DeleteButton({
  title = 'Удалить запись',
  confirm = '',
  onOk = () => {}
}) {
  return (
    <BsTrash
      style={{ marginLeft: 15, cursor: 'pointer' }} 
      size={17}
      color='red'
      title={title}
      onClick={() => {
        Modal.confirm({
          title: confirm,
          icon: <ExclamationCircleFilled />,
          okText: 'Да',
          okType: 'danger',
          cancelText: 'Нет',
          onOk: onOk
        })
      }}
    />
  )
}
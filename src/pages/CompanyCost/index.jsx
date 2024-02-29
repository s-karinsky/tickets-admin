import { useMemo, useState } from 'react'
import { Switch, Button, Table, Modal } from 'antd'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { BsTrash } from 'react-icons/bs'
import { ExclamationCircleFilled } from '@ant-design/icons'
import axios from '../../utils/axios'
import MakePaymentModal from '../../components/MakePaymentModal'
import Wrapper from '../../components/Wrapper'
import { useCompanyCost } from '../../utils/hooks'
import { getColumnSearchProps } from '../../utils/components'
import { localeNumber, localeCompare } from '../../utils/utils'
import { NEW_ID } from '../../consts'

export const ROOT_PATH = '/company-cost'

export default function CompanyCost() {
  const [ isCash, setIsCash ] = useState()
  const navigate = useNavigate()
  const { data, isLoading, refetch } = useCompanyCost()
  const [ modal, setModal ] = useState()
  
  const columns = useMemo(() => [
    {
      title: 'Номер',
      dataIndex: 'number',
      sorter: (a, b) => a.number - b.value,
      ...getColumnSearchProps('number')
    },
    {
      title: 'Дата',
      dataIndex: 'created_at',
      align: 'center',
      sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: date => dayjs(date).format('DD.MM.YYYY'),
      ...getColumnSearchProps('date', { type: 'date' })
    },
    {
      title: 'Счет',
      dataIndex: 'invoice_number',
      sorter: (a, b) => a.invoice_number - b.invoice_number,
      ...getColumnSearchProps('invoice_number')
    },
    {
      title: 'К оплате ($)',
      dataIndex: 'pay_usd',
      align: 'right',
      render: pay => localeNumber(pay),
      sorter: (a, b) => a.pay_usd - b.pay_usd,
      ...getColumnSearchProps('pay_usd', { type: 'number' })
    },
    {
      title: 'К оплате (₽)',
      dataIndex: 'pay_rub',
      align: 'right',
      render: pay => localeNumber(pay),
      sorter: (a, b) => a.pay_rub - b.pay_rub,
      ...getColumnSearchProps('pay_rub', { type: 'number' })
    },
    {
      title: 'Дата учета',
      dataIndex: 'done_date',
      align: 'center',
      render: date => date && dayjs(date).format('DD.MM.YYYY'),
      sorter: (a, b) => new Date(a.done_date).getTime() - new Date(b.done_date).getTime(),
      ...getColumnSearchProps('done_date', { type: 'date' })
    },
    {
      title: 'Наименование',
      dataIndex: 'name',
      sorter: (a, b) => localeCompare(a.name, b.name),
      ...getColumnSearchProps('name')
    },
    {
      title: 'Примечание',
      dataIndex: 'note',
      sorter: (a, b) => localeCompare(a.note, b.note),
      ...getColumnSearchProps('note')
    },
    {
      title: '',
      key: 'buttons',
      render: (_, item) => (
        <div style={{ whiteSpace: 'nowrap' }}>
          <Button
            style={{ marginRight: 15 }}
            size='small'
            htmlType='button'
            danger={item.pole?.done}
            onClick={() => {
              if (!item.pole?.done) {
                setModal(item)
              }
              else {
                Modal.confirm({
                  title: 'Отменить проведение счета?',
                  icon: <ExclamationCircleFilled />,
                  okText: 'Да',
                  okType: 'danger',
                  cancelText: 'Нет',
                  onOk: async () => {
                    await axios.update('dataset', { pole: JSON.stringify({ ...item.pole, done: false, done_date: '' }) }, `id=${item.id}`)
                    refetch()
                  }
                })
              }
            }}
          >
            {item.pole?.done ? 'Отменить' : 'Провести'}
          </Button>
          <BsTrash
            style={{ marginLeft: 15, cursor: 'pointer' }}
            size={17}
            color='red'
            onClick={() => {
              Modal.confirm({
                title: 'Вы действительно хотите удалить этот счет?',
                icon: <ExclamationCircleFilled />,
                okText: 'Да',
                okType: 'danger',
                cancelText: 'Нет',
                onOk: async () => {
                  await axios.update('dataset', { status: 1 }, `id=${item.id}`)
                  refetch()
                }
              })
            }}
          />
        </div>
      )
    }
  ], [])

  const filteredData = useMemo(() => (data || []).filter(item => {
    const payType = isCash ? 'Наличный' : 'Безналичный'
    return item.pay_type === payType
  }), [data, isCash])

  return (
    <Wrapper
      title='Расход средств компаний'
      breadcrumbs={[ { title: 'Расход средств компании' } ]}
      buttons={[
        <Switch
          style={{
            margin: '20px 20px 20px 0',
            transform: 'scale(140%)'
          }}
          checkedChildren='Наличные'
          unCheckedChildren='Безналичные'
          checked={isCash}
          onChange={setIsCash}
        />,
        <br />,
        <Button
          type='primary'
          size='large'
          onClick={() => navigate(`${ROOT_PATH}/${NEW_ID}`)}
        >
          Создать
        </Button>
      ]}
    >
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        onRow={record => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`${ROOT_PATH}/${record.id}`)
            }
          },
        })}
      />
      {!!modal && <MakePaymentModal
        title='Выберите дату проведения'
        onOk={async (date) => {
          await axios.update('dataset', { pole: JSON.stringify({ ...modal.pole, done: true, done_date: date.format('YYYY-MM-DD') }) }, `id=${modal.id}`)
          refetch()
          setModal(false)
        }}
        onCancel={() => setModal(false)}
      />}
    </Wrapper>
  )
}
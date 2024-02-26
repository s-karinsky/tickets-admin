import { useMemo, useState } from 'react'
import { Button, Table, Modal, DatePicker } from 'antd'
import { useNavigate } from 'react-router-dom'
import { BsTrash } from 'react-icons/bs'
import dayjs from 'dayjs'
import { ExclamationCircleFilled } from '@ant-design/icons'
import axios from '../../utils/axios'
import Wrapper from '../../components/Wrapper'
import { useCompanyIncome } from '../../utils/hooks'
import { getColumnSearchProps } from '../../utils/components'
import { NEW_ID } from '../../consts'

export const ROOT_PATH = '/company-income'

export default function CompanyIncome() {
  const navigate = useNavigate()
  const { data, isLoading, refetch } = useCompanyIncome()
  const [ modal, setModal ] = useState()
  const [ doneDate, setDoneDate ] = useState(dayjs())
  
  const columns = useMemo(() => [
    {
      title: 'Номер',
      dataIndex: 'number',
      ...getColumnSearchProps('number')
    },
    {
      title: 'Дата',
      dataIndex: 'date',
      render: date => date?.format('DD.MM.YYYY'),
      ...getColumnSearchProps('date', { type: 'date' })
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

  return (
    <Wrapper
      title='Приход средств компаний'
      breadcrumbs={[ { title: 'Приход средств компании' } ]}
      buttons={[
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
        dataSource={data}
        loading={isLoading}
        onRow={record => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`${ROOT_PATH}/${record.id}`)
            }
          },
        })}
      />
      {!!modal &&
        <Modal
          title='Выберите дату проведения'
          onOk={async () => {
            await axios.update(
              'dataset',
              { pole: JSON.stringify({ ...modal.pole, done: true, done_date: doneDate.format('YYYY-MM-DD') }) },
              `id=${modal.id}`
            )
            refetch()
            setModal(false)
          }}
          onCancel={() => setModal(false)}
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
      }
    </Wrapper>
  )
}
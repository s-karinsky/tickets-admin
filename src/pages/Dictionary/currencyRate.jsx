import { useState } from 'react'
import { Row, Col, Typography, Table, Button, Modal } from 'antd'
import { useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import axios from '../../utils/axios'
import CurrencyForm from './currencyForm'
import { useCurrencyRates } from '../../utils/api'
import { getColumnSearchProps } from '../../utils/components'

const columns = [
  {
    title: 'Дата',
    dataIndex: 'date',
    align: 'center',
    sorder: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    ...getColumnSearchProps('date', { type: 'date' })
  },
  {
    title: 'Курс',
    dataIndex: 'rate',
    align: 'right',
    sorter: (a, b) => a.rate - b.rate,
    ...getColumnSearchProps('rate', { type: 'number' }) 
  }
]

export default function CurrencyRate() {
  const [ edit, setEdit ] = useState(false)
  const [ modal, contextHolder ] = Modal.useModal();
  const { id } = useParams()
  const { data = [], isLoading, refetch } = useCurrencyRates(id)
  const navigate = useNavigate()

  return (
    <>
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>Курс {id}</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            type='primary'
            size='large'
            onClick={() => setEdit({})}
          >
            Создать
          </Button>
        </Col>
      </Row>
      <Table
        size='small'
        columns={columns}
        dataSource={data}
        isLoading={isLoading}
        rowKey={({ date }) => date}
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              setEdit({
                ...record,
                date: dayjs(record.date)
              })
            }
          },
        })}
      />
      {!!edit && <CurrencyForm
        name={id}
        onSubmit={async (values) => {
          const date = values.date.format('YYYY-MM-DD')
          let response
          if (!edit.date) {
            response = await axios.postWithAuth('/query/insert', { sql: `INSERT INTO currency_rate (currency, rate, date) VALUES ('${id}', '${values.rate}', '${date}')` })
          } else {
            response = await axios.postWithAuth('/query/update', { sql: `UPDATE currency_rate SET rate='${values.rate}', date='${date}' WHERE currency='${id}' AND date='${edit.date.format('YYYY-MM-DD')}'` })
          }
          if (response.data.status === 'error') {
            modal.error({
              title: 'Произошла ошибка',
              content: response.data.message
            })
          } else {
            refetch()
            setEdit(false)
          }
        }}
        onCancel={() => setEdit(false)}
        {...edit}
      />}
      {contextHolder}
    </>
  )
}
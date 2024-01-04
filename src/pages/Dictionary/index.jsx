import { useMemo, useCallback } from 'react'
import { Row, Col, Typography, Table, Button, Modal } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { BsTrash } from 'react-icons/bs'
import axios from '../../utils/axios'
import { useDictionary } from '../../utils/api'

const TITLE = {
  drivers: 'Перевозчики',
  rates: 'Тарифы перевозок',
  currency: 'Валюта и курс'
}

const getColumns = (name, params = {
  onDelete: () => {}
}) => {
  const buttonsColumn = {
    title: '',
    width: 30,
    key: 'buttons',
    render: (_, item) => (
      <div>
        <BsTrash
          style={{ marginLeft: 30, cursor: 'pointer' }} 
          size={17}
          color='red'
          title='Удалить запись'
          onClick={() => {
            Modal.confirm({
              title: 'Вы действительно хотите удалить эту запись?',
              icon: <ExclamationCircleFilled />,
              okText: 'Да',
              okType: 'danger',
              cancelText: 'Нет',
              onOk: async () => params.onDelete(item)
            })
          }}
        />
      </div>
    )
  }

  switch (name) {
    case 'drivers':
      return [
        {
          title: 'Код',
          dataIndex: 'value'
        },
        {
          title: 'Компания',
          dataIndex: 'company_name'
        },
        {
          title: 'ФИО',
          key: 'name',
          render: (_, item) => ([item.family, item.name, item.middle].filter(Boolean).join(' '))
        },
        {
          title: 'Тел. ответственного',
          dataIndex: 'phone'
        },
        {
          title: 'Тел. компании',
          dataIndex: 'company_phone'
        },
        buttonsColumn
      ]

    case 'rates':
      return [
        {
          title: 'Код',
          dataIndex: 'value'
        },
        {
          title: 'Наименование',
          dataIndex: 'label'
        },
        {
          title: 'Тип оплаты',
          dataIndex: 'pay_type'
        },
        {
          title: 'Цена за 1 кг',
          dataIndex: 'price_kg'
        },
        buttonsColumn
      ]

    default:
      return []
  }
}

export default function Dictionary() {
  const { name } = useParams()
  const { data = {}, isLoading, refetch } = useDictionary(name)
  const navigate = useNavigate()

  const onDelete = useCallback(item => 
    axios.postWithAuth('/query/update', { sql: `UPDATE sprset SET status=1 WHERE id=${item.id}` }).then(() => refetch()),
  [axios, refetch])

  const columns = useMemo(() => getColumns(name, {
    onDelete
  }), [name])
  return (
    <>
      <Row align='middle' style={{ padding: '0 40px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>{TITLE[name]}</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          <Button
            type='primary'
            size='large'
            onClick={() => navigate(`/dictionary/${name}/create`)}
          >
            Создать
          </Button>
        </Col>
      </Row>
      <Table
        columns={columns}
        dataSource={data.list || []}
        isLoading={isLoading}
        rowKey={({ id }) => id}
        onRow={(record, index) => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`/dictionary/${name}/${record.id}`)
            }
          },
        })}
      />
    </>
  )
}
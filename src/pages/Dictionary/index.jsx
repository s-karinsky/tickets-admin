import { useMemo, useCallback } from 'react'
import { Row, Col, Typography, Table, Button, Modal } from 'antd'
import { ExclamationCircleFilled } from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { BsTrash } from 'react-icons/bs'
import { localeCompare, getPaginationSettings } from '../../utils/utils'
import axios from '../../utils/axios'
import { useDictionary } from '../../utils/api'
import { getColumnSearchProps } from '../../utils/components'

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
          dataIndex: 'value',
          sorter: (a, b) => localeCompare(a.value, b.value),
          ...getColumnSearchProps('value')
        },
        {
          title: 'Компания',
          dataIndex: 'company_name',
          sorter: (a, b) => localeCompare(a.company_name, b.company_name),
          ...getColumnSearchProps('company_name')
        },
        {
          title: 'ФИО',
          key: 'name',
          render: (_, item) => ([item.family, item.name, item.middle].filter(Boolean).join(' ')),
          sorter: (a, b) => localeCompare([a.family, a.name, a.middle].filter(Boolean).join(' '), [b.family, b.name, b.middle].filter(Boolean).join(' ')),
          ...getColumnSearchProps(item => ([item.family, item.name, item.middle].filter(Boolean).join(' ')))
        },
        {
          title: 'Тел. ответственного',
          dataIndex: 'phone',
          sorter: (a, b) => localeCompare(a.phone, b.phone),
          ...getColumnSearchProps('phone')
        },
        {
          title: 'Тел. компании',
          dataIndex: 'company_phone',
          sorter: (a, b) => localeCompare(a.company_phone, b.company_phone),
          ...getColumnSearchProps('company_phone')
        },
        {
          title: 'Примечание',
          dataIndex: 'note',
          render: note => <div style={{ maxWidth: 80, maxHeight: 55, overflow: 'hidden', textOverflow: 'ellipsis' }} title={note}>{note}</div>
        },
        buttonsColumn
      ]

    case 'rates':
      return [
        {
          title: 'Код',
          dataIndex: 'code',
          sorter: (a, b) => localeCompare(a.value, b.value),
          ...getColumnSearchProps('value')
        },
        {
          title: 'Наименование',
          dataIndex: 'label',
          sorter: (a, b) => localeCompare(a.label, b.label),
          ...getColumnSearchProps('label')
        },
        {
          title: 'Примечание',
          dataIndex: 'note'
        },
        buttonsColumn
      ]

    case 'currency':
      return [
        {
          title: 'Код',
          dataIndex: 'id',
          sorter: (a, b) => localeCompare(a.id, b.id),
          ...getColumnSearchProps('id')
        },
        {
          title: 'Название',
          dataIndex: 'name',
          sorter: (a, b) => localeCompare(a.name, b.name),
          ...getColumnSearchProps('name')
        }
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
        size='small'
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
        pagination={getPaginationSettings(`dictionary-${name}`)}
      />
    </>
  )
}
import { Tag } from 'antd'
import { getColumnSearchProps } from './utils/components'
import { localeCompare, getSurnameWithInitials } from './utils/utils'

export const API_URL = 'https://ibronevik.ru/taxi/c/cargo/api/v1'

export const USER_ROLES_COLOR = {
  '1': '#2db7f5',
  '2': '#87d068',
  '3': '#1059ad',
  '4': '#f50'
}

export const USER_ROLES = {
  '1': 'Клиент',
  '2': 'Сотрудник',
  '3': 'Внутренний клиент',
  '4': 'Админ'
}

export const USER_ROLES_OPTIONS = ['1', '2', '3', '4']

export const SENDING_STATUS = ['Формирование', 'В пути', 'Поступила', 'Приостановлен']

export const SERVICE_NAME = {
  issuance: 'Выдача со склада',
  delivery: 'Доставка',
  fullfillment: 'Фулфилмент',
  storage: 'Хранение',
  repack: 'Переупаковка'
}

export const SERVICE_STATUS = {
  issuance: ['Подготовка выдачи', 'Выдано'],
  delivery: ['Подготовка доставки', 'Доставка до терминала', 'Доставка до адреса', 'Выдача с терминала', 'Выдано'],
  fullfillment: ['Подготовка фулфилмента', 'Обработка', 'Отгрузка на маркетплейс', 'Отгружено на меркетплейс'],
  storage: ['Подготовка хранения', 'Хранение', 'Закончено хранение'],
  repack: ['Подготовка переупаковки', 'Переупаковано']
}

export const VALIDATION_MESSAGES = {
  required: 'Обязательное поле'
}

export const MARKETPLACES = [{ value: 'Wilberries' }, { value: 'OZON' }, { value: 'Яндекс' }, { value: 'Lamoda' }]

export const COLUMNS = {
  role: {
    title: 'Роль',
    dataIndex: 'id_role',
    render: text => (<Tag color={USER_ROLES_COLOR[text]}>{USER_ROLES[text]}</Tag>),
    filters: Object.keys(USER_ROLES).map(id => ({
      text: USER_ROLES[id],
      value: id
    })),
    onFilter: (value, record) => record.id_role === value
  },
  code: {
    title: 'Код',
    dataIndex: ['json', 'code'],
    key: 'code',
    sorter: (a, b) => localeCompare(a.json?.code, b.json?.code),
    ...getColumnSearchProps(record => record.json?.code)
  },
  name: {
    title: 'ФИО',
    dataIndex: 'name',
    key: 'name',
    render: (name, { middle, family }) => getSurnameWithInitials(family, name, middle) || 'No name',
    sorter: (a, b) => localeCompare(getSurnameWithInitials(a.family, a.name, a.middle), getSurnameWithInitials(b.family, b.name, b.middle)),
    ...getColumnSearchProps(record => getSurnameWithInitials(record.family, record.name, record.middle))
  },
  phone: {
    title: 'Телефон',
    dataIndex: 'phone',
    render: phone => !phone || phone.startsWith('+') ? (phone || '') : `+${phone}`,
    sorter: (a, b) => localeCompare(a.phone, b.phone),
    ...getColumnSearchProps('email')
  },
  company: {
    title: 'Компания/ИП',
    dataIndex: ['json', 'company'],
    key: 'company',
    render: company => company?.name
  },
  email: {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: email => email || 'No email',
    sorter: (a, b) => localeCompare(a.email, b.email),
    ...getColumnSearchProps('email')
  }
}
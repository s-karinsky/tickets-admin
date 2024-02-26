import { emailRule } from '../../utils/validationRules'
import { USER_ROLES_OPTIONS, USER_ROLES } from '../../consts'
import axios from '../../utils/axios'

export const getCommonFields = (initialValues, isNew) => [
  {
    name: ['json', 'code'],
    label: 'Код',
    required: true,
    span: 3,
    rules: [
      ({ getFieldValue }) => ({
        validator: async (_, code) => {
          if (!isNew && parseInt(code) === parseInt(initialValues?.json?.code)) return Promise.resolve()
          const resposne = await axios.select('users', '*', { where: { '$.json.code': code, deleted: 0 } })
          console.log(resposne.data?.data)
          const count = (resposne.data?.data || []).length
          return count > 0 ? Promise.reject(new Error('Номер уже используется')) : Promise.resolve()
        },
      })
    ]
  },
  {
    name: 'id_role',
    label: 'Роль',
    type: 'select',
    options: USER_ROLES_OPTIONS.filter(item => item !== '3').map(value => ({ value, label: USER_ROLES[value] })),
    required: true,
    span: 5
  }
]

export const getFieldsByRole = (role) => [
  {
    name: 'name',
    label: 'Имя',
    required: ['2', '3'].includes(role),
    span: 8
  },
  {
    name: 'family',
    label: 'Фамилия',
    required: ['2', '3'].includes(role),
    span: 8
  },
  {
    name: 'middle',
    label: 'Отчество',
    span: 8
  },
  {
    name: 'phone',
    label: 'Телефон',
    required: true,
    mask: '+00000000000[0]',
    span: 8
  },
  role !== '3' && {
    name: 'email',
    label: 'E-mail',
    required: true,
    rules: [emailRule('Введите корректный e-mail')],
    span: 8
  },
  role !== '3' && {
    name: ['json', 'addPhone'],
    label: role === '1' ? 'Доп. телефон' : 'Личный телефон',
    mask: '+00000000000[0]',
    span: 8
  },
  {
    type: 'city',
    nameCity: ['json', 'city'],
    nameCountry: ['json', 'country'],
    span: 8
  },
  {
    name: ['json', 'note'],
    label: 'Примечание',
    type: 'textarea',
    span: 24
  }
].filter(Boolean)

export const companyFields = [
  {
    name: ['json', 'company', 'name'],
    label: 'Компания/ИП',
    span: 8
  },
  {
    name: ['json', 'company', 'head'],
    label: 'Руководитель',
    span: 8
  },
  {
    name: ['json', 'company', 'inn'],
    label: 'ИНН/УНП',
    span: 8
  },
  {
    name: ['json', 'company', 'certificate'],
    label: 'Свидетельство о регистрации',
    span: 8
  },
  {
    name: ['json', 'company', 'address'],
    label: 'Юридический адрес',
    span: 8
  },
  {
    name: ['json', 'company', 'phone'],
    label: 'Телефон',
    mask: '+00000000000[0]',
    span: 8
  },
  {
    name: ['json', 'company', 'email'],
    label: 'E-mail',
    rules: [emailRule('Введите корректный e-mail')],
    span: 8
  },
  {
    name: ['json', 'company', 'unloadAddress'],
    label: 'Адрес разгрузки',
    span: 8
  },
  {
    name: ['json', 'company', 'bank'],
    label: 'Наименование банка',
    span: 8
  },
  {
    name: ['json', 'company', 'bik'],
    label: 'БИК банка',
    span: 8
  },
  {
    name: ['json', 'company', 'swift'],
    label: 'SWIFT или Кор. счет',
    span: 8
  },
  {
    name: ['json', 'company', 'checkingAccount'],
    label: 'Расчетный счет',
    span: 8
  },
  {
    name: ['json', 'company', 'bankAddress'],
    label: 'Адрес банка',
    span: 8
  }
]
import { useMemo, useState } from 'react'
import {
  UserOutlined,
  DownOutlined,
  UnorderedListOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CarOutlined,
  FormOutlined,
  SnippetsOutlined,
  DollarOutlined
} from '@ant-design/icons'
import { Avatar, Button, Dropdown, Menu, Space, Layout, Row, Col } from 'antd'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import Cookies from 'universal-cookie'
import styles from './styles.module.scss'

const { Header, Sider, Content } = Layout

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  }
}

const MENU_ITEMS = {
  services: getItem('Услуги', 'services', <UnorderedListOutlined />, [
    getItem(<Link to='/services/issuance'>Выдача со склада</Link>, 'services-issuance'),
    getItem(<Link to='/services/delivery'>Доставка</Link>, 'services-delivery'),
    getItem(<Link to='/services/fullfillment'>Фулфилмент</Link>, 'services-fullfillment'),
    getItem(<Link to='/services/storage'>Хранение</Link>, 'services-storage'),
    getItem(<Link to='/services/repack'>Переупаковка</Link>, 'services-repack')
  ]),
  dictionary: getItem('Справочники', 'dictionaries', <FormOutlined />, [
    // getItem(<Link to='/dictionary/config'>Параметры учета</Link>, 'dictionary-config'),
    getItem(<Link to='/dictionary/config'>Параметры учёта</Link>, 'dictionary-config'),
    getItem(<Link to='/dictionary/employees'>Сотрудники</Link>, 'dictionary-employees'),
    getItem(<Link to='/dictionary/clients'>Клиенты</Link>, 'dictionary-clients'),
    getItem(<Link to='/dictionary/drivers'>Перевозчики</Link>, 'dictionary-drivers'),
    getItem(<Link to='/dictionary/rates'>Тарифы перевозок</Link>, 'dictionary-rates'),
    getItem(<Link to='/dictionary/currency'>Валюта и курс</Link>, 'dictionary-currency')
  ]),
  templates: getItem(<Link to='/templates'>Шаблоны</Link>, 'templates', <SnippetsOutlined />),
  users: getItem(<Link to='/users'>Пользователи</Link>, 'users', <UserOutlined />),
  sendings: getItem(
    'Отправки',
    'sendings',
    <CarOutlined />,
    [
      getItem(<Link to='/sendings'>Авто</Link>, 'sendings-auto'),
      getItem(<Link to='/sendings?air'>Авиа</Link>, 'sendings-air')
    ]
  ),
  finances: getItem(
    'Финансы',
    'finances',
    <DollarOutlined />,
    [
      getItem(
        'Клиенты',
        'client-finances',
        null,
        [
          getItem(<Link to='/client-invoices'>Счета на оплату</Link>, 'client-invoices'),
          getItem(<Link to='/client-payments'>Оплаты</Link>, 'client-payments')
        ]
      )
    ]
  )
}

export default function PageLayout({ user }) {
  const [ collapsed, setCollapsed ] = useState(false)
  const navigate = useNavigate()

  const items = useMemo(() => {
    if (user.u_role === '4') {
      return [
        MENU_ITEMS.users,
        MENU_ITEMS.dictionary,
        MENU_ITEMS.sendings,
        MENU_ITEMS.services,
        MENU_ITEMS.finances,
        MENU_ITEMS.templates
      ]
    }
  }, [user.u_role])

  const toggleCollapsed = () => setCollapsed(!collapsed)

  const userItems = useMemo(
    () => [
      {
        label: (
          <Button
            type='link'
            onClick={e => {
              e.preventDefault()
              const cookies = new Cookies()
              cookies.remove('token')
              cookies.remove('u_hash')
              navigate('/login')
            }}
          >
            Logout
          </Button>
        ),
        key: '0',
      },
    ],
    [navigate]
  )

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <Row justify='space-between'>
          <Col style={{ marginLeft: -30 }}>
            <Button
              type='primary'
              onClick={toggleCollapsed}
              style={{ marginBottom: 16 }}
            >
              {collapsed ? (
                <MenuUnfoldOutlined />
              ) : (
                <MenuFoldOutlined />
              )}
            </Button>
          </Col>
          <Col>
            <Avatar src={user.u_photo} />
            <Dropdown
              menu={{ items: userItems }}
              trigger={['click']}
            >
              <span
                className={styles.headerUser}
              >
                <Space>
                  {user.u_name}
                  <DownOutlined
                    style={{ fontSize: '10px' }}
                  />
                </Space>
              </span>
            </Dropdown>
          </Col>
        </Row>
      </Header>
      <Layout>
        <Sider collapsed={collapsed}>
          <Menu
            items={items}
            theme='dark'
            mode='inline'
          />
        </Sider>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

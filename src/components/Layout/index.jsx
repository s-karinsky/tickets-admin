import { useMemo, useState } from 'react'
import {
  UserOutlined,
  DownOutlined,
  UnorderedListOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  CarOutlined
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
    getItem(<Link to='/services/delivery'>Выдача со склада</Link>, 'services-delivery')
  ]),
  users: getItem(<Link to='/users'>Пользователи</Link>, 'users', <UserOutlined />),
  sendings: getItem(
    <Link to='/sendings'>Отправки</Link>,
    'sendings',
    <CarOutlined />
  ),
}

export default function PageLayout({ user }) {
  const [ collapsed, setCollapsed ] = useState(false)
  const navigate = useNavigate()

  const items = useMemo(() => {
    if (user.u_role === '4') {
      return [
        MENU_ITEMS.users,
        MENU_ITEMS.sendings,
        MENU_ITEMS.services
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

import { useMemo, useState } from 'react'
import {
  BarcodeOutlined,
  UserOutlined,
  DownOutlined,
  UnorderedListOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  FileTextOutlined
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Dropdown,
  Menu,
  Space,
  Layout,
  Row,
  Col
} from 'antd'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../redux/user'
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
  content: getItem('Content', 'content', <FileTextOutlined />, [
    getItem(<Link to='/content/footer'>Footer</Link>, 'content-footer'),
    getItem(<Link to='/content/home'>Homepage</Link>, 'content-homepage')
  ]),
  users: getItem(<Link to='/users'>Users</Link>, 'users', <UserOutlined />),
  matches: getItem(<Link to='/matches'>Matches</Link>, 'matches', <UnorderedListOutlined />),
  tickets: getItem(<Link to='/tickets'>Tickets</Link>, 'tickets', <BarcodeOutlined />)
}

export default function PageLayout() {
  const [ collapsed, setCollapsed ] = useState(false)
  const user = useSelector(state => state.user.profile)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const items = useMemo(() => {
    if (user.u_role === '4') {
      return [MENU_ITEMS.content, MENU_ITEMS.users, MENU_ITEMS.matches, MENU_ITEMS.tickets]
    } else if (user.u_role === '2') {
      return [MENU_ITEMS.tickets]
    }
  }, [user.u_role])

  const toggleCollapsed = () => setCollapsed(!collapsed)

  const path = location.pathname.split('/')[1]

  const userItems = useMemo(() => ([
    {
      label:
        <a
          onClick={e => {
            e.preventDefault()
            dispatch(logout)
            navigate('/login')
          }}
        >
          Logout
        </a>,
      key: '0',
    },
  ]), [navigate, dispatch])

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <Row justify="space-between">
          <Col style={{ marginLeft: -30 }}>
            <Button type="primary" onClick={toggleCollapsed} style={{ marginBottom: 16 }}>
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </Button>
          </Col>
          <Col>
            <Avatar src={user.u_photo} />
            <Dropdown menu={{ items: userItems }} trigger={['click']}>
              <a onClick={(e) => e.preventDefault()} className={styles.headerUser}>
                <Space>
                  {user.u_name}
                  <DownOutlined style={{ fontSize: '10px' }} />
                </Space>
              </a>
            </Dropdown>
          </Col>
        </Row>
      </Header>
      <Layout>
        <Sider
          collapsed={collapsed}
        >
          <Menu
            selectedKeys={[path]}
            theme='dark'
            items={items}
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
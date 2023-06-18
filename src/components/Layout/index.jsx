import { useMemo } from 'react'
import { UserOutlined, DownOutlined } from '@ant-design/icons'
import {
  Avatar,
  Dropdown,
  Menu,
  Space,
  Layout,
  Row,
  Col
} from 'antd'
import { Outlet, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../../redux/user'
import styles from './styles.module.scss'

const { Header, Footer, Sider, Content } = Layout

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  }
}

const items = [
  getItem('Users', '1', <UserOutlined />),
]

export default function PageLayout() {
  const user = useSelector(state => state.user.profile)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const userItems = useMemo(() => ([
    {
      label: <a onClick={e => {
        e.preventDefault()
        dispatch(logout)
        navigate('/login')
      }}>Logout</a>,
      key: '0',
    },
  ]), [dispatch])

  return (
    <Layout>
      <Sider>
        <Menu
          defaultSelectedKeys={['1']}
          theme="dark "
          items={items}
        />
      </Sider>
      <Layout>
        <Header>
          <Row justify="end">
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
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
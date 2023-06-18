import { UserOutlined } from '@ant-design/icons'
import {
  Col,
  Row,
  Button,
  Menu,
  Layout,
  Space
} from 'antd'
import { Outlet } from 'react-router-dom'

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
        <Header style={{ backgroundColor: '#ccc' }}>
          Test
        </Header>
        <Content>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
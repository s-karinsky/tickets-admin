import {
  Col,
  Row,
  Button,
  Checkbox,
  Form,
  Input
} from 'antd'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login } from '../../redux/user'

export default function LoginPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  return (
    <Row style={{ height: '100vh' }} justify="center" align="middle">
      <Col span={8}>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600, textAlign: 'left' }}
          initialValues={{ remember: true }}
          onFinish={values => dispatch(login(values)).then(isSuccess => {
            if (isSuccess) navigate('/users')
          })}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="login"
            rules={[{ required: true, message: 'Please input your email!' }]}
          >
            <Input type="email" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  )
}
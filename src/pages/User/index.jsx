import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { Avatar, Col, Row, Tag } from 'antd'
import { getUser } from '../../redux/users'
import { USER_ROLES, USER_ROLES_COLOR } from '../../consts'

export default function PageUser() {
  const dispatch = useDispatch()
  const profile = useSelector(state => state.users.currentProfile)
  const { id } = useParams()

  useEffect(() => {
    dispatch(getUser(id))
  }, [id])

  if (!profile) {
    return null
  }

  return (
    <Row style={{ margin: '20px' }}>
      <Col span={4}>
        <Avatar
          style={{ width: '128px', height: '128px', fontSize: '64px', lineHeight: '120px' }}
          src={profile.u_photo}
        >
          {(profile.u_name || '?')[0].toUpperCase()}
        </Avatar>
      </Col>
      <Col>
        {profile.u_name || 'No name'}<br />
        {profile.u_email || 'No email'}<br />
        <Tag color={USER_ROLES_COLOR[profile.u_role]}>{USER_ROLES[profile.u_role]}</Tag>
      </Col>
    </Row>
  )
}
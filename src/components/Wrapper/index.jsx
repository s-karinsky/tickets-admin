import { Breadcrumb, Col, Row, Typography } from 'antd'

export default function Wrapper({
  breadcrumbs,
  title,
  buttons,
  children
}) {
  return (
    <>
      {!!breadcrumbs && <Breadcrumb
        items={breadcrumbs}
        style={{ margin: '40px 0 0 30px' }}
      />}
      <Row align='middle' style={{ padding: '0 20px' }}>
        <Col span={12}>
          <Typography.Title style={{ fontWeight: 'bold' }}>{title}</Typography.Title>
        </Col>
        <Col span={12} style={{ textAlign: 'right' }}>
          {buttons}
        </Col>
      </Row>
      {children}
    </>
  )
}
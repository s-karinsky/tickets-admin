import React from 'react'
import { Typography } from 'antd';
const { Title, Text } = Typography
export const Property = ({ title, subtitle }) => {
  return (
    <div style={{ minWidth: 200 }}>
      <Text
        level={5}
        style={{ color: '#757575', marginTop: 0, marginBottom: 0 }}
      >
        {title}
      </Text>
      <Title
        level={5}
        style={{
          color: '#000',
          marginTop: 0,
          marginBottom: 0,
          lineHeight: '24px',
        }}
      >
        {subtitle}
      </Title>
    </div>
  )
}

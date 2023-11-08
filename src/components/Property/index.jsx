import React from "react";
import { Typography } from "antd";
const { Title } = Typography;
export const Property = ({ title, subtitle }) => {
    return (
        <div style={{ minWidth: 200 }}>
            <Title level={5} style={{ color: "#757575", marginTop: 0 }}>
                {title}
            </Title>
            <Title level={4} style={{ color: "#000", marginTop: 0 }}>
                {subtitle}
            </Title>
        </div>
    );
};

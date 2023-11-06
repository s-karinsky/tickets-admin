import React from "react";
import { CalendarOutlined } from "@ant-design/icons";
export const DateTableCell = ({ date }) => {
    return (
        <div>
            <CalendarOutlined style={{ marginRight: 5 }} />

            {typeof date === "string" ? date : date.toLocaleDateString()}
        </div>
    );
};

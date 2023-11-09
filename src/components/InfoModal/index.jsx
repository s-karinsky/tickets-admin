import React from "react";
import { Row, Typography, Select, Modal, DatePicker, Button } from "antd";
import {
    ArrowRightOutlined,
    DeleteOutlined,
    FormOutlined,
} from "@ant-design/icons";
import { Property } from "../Property";
const { Title } = Typography;
const { RangePicker } = DatePicker;
export const InfoModal = ({
    isModalOpen,
    handleOk,
    handleCancel,
    content,
    title,
    onNextHandle,
    onEditHandle,
    disabled,
}) => {
    return (
        <Modal
            style={{ maxWidth: 800 }}
            width={"100%"}
            title={
                <Title
                    level={2}
                    style={{
                        fontWeight: "700",
                        marginBottom: "0",
                        marginTop: 0,
                    }}
                >
                    {title}
                </Title>
            }
            open={isModalOpen}
            onCancel={handleCancel}
            footer={
                !disabled
                    ? [
                          <Button
                              key="1"
                              type="primary"
                              style={{ backgroundColor: "rgb(0, 150, 80)" }}
                              onClick={() => onNextHandle()}
                          >
                              Перейти <ArrowRightOutlined />
                          </Button>,
                          <Button onClick={onEditHandle} key="2" type="primary">
                              Редактировать <FormOutlined />
                          </Button>,
                          <Button key="3" danger type="primary">
                              Удалить <DeleteOutlined />
                          </Button>,
                      ]
                    : [
                          <Button
                              key="1"
                              type="primary"
                              style={{ backgroundColor: "rgb(0, 150, 80)" }}
                              onClick={() => onNextHandle()}
                          >
                              Сохранить <ArrowRightOutlined />
                          </Button>,
                      ]
            }
        >
            <Row
                style={{
                    display: "flex",
                    gap: "10px 10px",

                    padding: "20px 0",
                }}
            >
                {Object.values(content).map((item) => (
                    <Property title={item[1]} subtitle={item[0]} />
                ))}
            </Row>
        </Modal>
    );
};

import React from "react";
import { Row, Typography, Select, Modal, DatePicker } from "antd";

const { Title } = Typography;
const { RangePicker } = DatePicker;
export const FilterModal = ({
    isModalOpen,
    handleOk,
    handleCancel,
    columns,
}) => {
    return (
        <Modal
            style={{ maxWidth: 450 }}
            title={
                <Title
                    level={2}
                    style={{
                        fontWeight: "700",
                        marginBottom: "0",
                        marginTop: 0,
                    }}
                >
                    Фильтры
                </Title>
            }
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
        >
            <p>Дата создания</p>
            <RangePicker
                placeholder={["От", "До"]}
                size="large"
                style={{ width: "100%" }}
            />
            <Row
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <div style={{ maxWidth: 190, width: "100%" }}>
                    <p>Перевозчик</p>
                    <Select
                        style={{
                            maxWidth: "190px",
                            width: "100%",
                        }}
                        placeholder="Фильтр"
                        optionFilterProp="children"
                        options={[
                            {
                                title: "alex",
                                value: "Александр",
                            },
                            {
                                title: "vlad",
                                value: "Владимир",
                            },
                        ]}
                    />
                </div>
                <div style={{ maxWidth: 190, width: "100%" }}>
                    <p>Статус</p>
                    <Select
                        style={{
                            maxWidth: "190px",
                            width: "100%",
                        }}
                        placeholder="Фильтр"
                        optionFilterProp="children"
                        options={[
                            {
                                title: 0,
                                value: "Формирование",
                            },
                            {
                                title: 1,
                                value: "В пути",
                            },
                            {
                                title: 2,
                                value: "Поступила",
                            },
                        ]}
                    />
                </div>
            </Row>
            <p>Дата отправки</p>
            <RangePicker
                placeholder={["От", "До"]}
                size="large"
                style={{ width: "100%" }}
            />
            <p>Дата прибытия</p>
            <RangePicker
                placeholder={["От", "До"]}
                size="large"
                style={{ width: "100%" }}
            />
        </Modal>
    );
};

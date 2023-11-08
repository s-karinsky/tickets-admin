import React from "react";
import { Form, Input, Select, DatePicker, Typography } from "antd";
import TextArea from "antd/es/input/TextArea";
const { Title } = Typography;

export const CreateProductInput = () => {
    return (
        <Form
            style={{
                display: "flex",
                gap: "20px 10px",
                flexWrap: "wrap",
                alignItems: "flex-end",
            }}
        >
            <Input
                addonAfter="Марка"
                placeholder="10"
                size="large"
                style={{ maxWidth: "250px" }}
            />
            <Input
                addonAfter="Цвет"
                placeholder="10"
                size="large"
                style={{ maxWidth: "250px" }}
            />
            <Input
                addonAfter="Цена, $"
                placeholder="10"
                size="large"
                style={{ maxWidth: "250px" }}
            />
            <Input
                addonAfter="Сумма, $"
                placeholder="10"
                size="large"
                style={{ maxWidth: "250px" }}
            />
            <Input
                addonAfter="Состав/материал"
                placeholder="10"
                size="large"
                style={{ maxWidth: "250px" }}
            />
            <Input
                addonAfter="Размер"
                placeholder="10"
                size="large"
                style={{ maxWidth: "250px" }}
            />
            <Input
                addonAfter="Вес нетто, кг"
                placeholder="10"
                size="large"
                style={{ maxWidth: "250px" }}
            />
            <Input
                addonAfter="ТН ВЭД ТС"
                placeholder="10"
                size="large"
                style={{ maxWidth: "250px" }}
            />
            <Input
                addonAfter="Количество"
                placeholder="10"
                size="large"
                style={{ maxWidth: "250px" }}
            />
            <Title
                style={{
                    width: "100%",
                    marginTop: 10,
                    marginBottom: 0,
                    color: "#757575",
                }}
                level={3}
            >
                Сертификат/Декларация о соответствии
            </Title>
            <Input
                addonAfter="Номер"
                placeholder="10"
                size="large"
                style={{ maxWidth: "250px" }}
            />
            <div style={{ position: "relative" }}>
                <div
                    style={{
                        position: "absolute",
                        top: -15,
                        left: 10,
                        zIndex: 2,
                        color: "#757575",
                    }}
                >
                    От
                </div>
                <DatePicker size="large" />
            </div>
            <div style={{ position: "relative" }}>
                <div
                    style={{
                        position: "absolute",
                        top: -15,
                        left: 10,
                        zIndex: 2,
                        color: "#757575",
                    }}
                >
                    До
                </div>
                <DatePicker size="large" />
            </div>
            <TextArea placeholder="Примечание" rows={4} />
        </Form>
    );
};
export default CreateProductInput;

import React from "react";
import {
    Typography,
    Modal,
    DatePicker,
    Button,
    Form,
    Input,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { PropertyGap } from "../../pages/Sendings";
const { Title } = Typography;
export const CreateProductModal = ({
    isModalOpen,
    handleCancel,
    title,
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
            footer={[
                <Button
                    key="1"
                    type="primary"
                    style={{ backgroundColor: "rgb(0, 150, 80)" }}
                    onClick={() => handleCancel()}
                >
                    Сохранить
                </Button>,
            ]}
        >
            <Form
                style={{
                    display: "flex",
                    gap: `${PropertyGap}px`,
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
                            paddingLeft: 10,
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
                            paddingLeft: 10,
                            color: "#757575",
                        }}
                    >
                        До
                    </div>
                    <DatePicker size="large" />
                </div>
                <TextArea placeholder="Примечание" rows={4} />
            </Form>
        </Modal>
    );
};
export default CreateProductModal;

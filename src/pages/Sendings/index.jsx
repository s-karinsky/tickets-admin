import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Row,
    Table,
    Typography,
    Input,
    Select,
    Modal,
    DatePicker,
} from "antd";
import { getSendingsList } from "../../redux/data";

import { useState } from "react";
import { SendingsStatus } from "../../components/SendingsStatus";
import { DateTableCell } from "../../components/DateTableCell";

const { Title, Link } = Typography;
const { RangePicker } = DatePicker;

export default function Sendings() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const isLoading = useSelector((state) => state.data.isLoading);
    //let sendings = useSelector(getSendingsList);
    let sendings = [
        {
            code: 1,
            date: <DateTableCell date={new Date()} />,
            transporter: "Александ В.",
            status: <SendingsStatus status={3} />,
            "departure-date": <DateTableCell date={new Date()} />,
            "delivery-date": <DateTableCell date={new Date()} />,
        },
        {
            code: 2,
            date: <DateTableCell date={new Date()} />,
            transporter: "рлександ В.",
            status: <SendingsStatus status={1} />,
            "departure-date": <DateTableCell date={new Date()} />,
            "delivery-date": <DateTableCell date={new Date()} />,
        },
        {
            code: 3,
            date: <DateTableCell date={new Date()} />,
            transporter: "рлександ В.",
            status: <SendingsStatus status={2} />,
            "departure-date": <DateTableCell date={new Date()} />,
            "delivery-date": <DateTableCell date={new Date()} />,
        },
        {
            code: 5,
            date: <DateTableCell date={new Date()} />,
            transporter: "рлександ В.",
            status: <SendingsStatus status={0} />,
            "departure-date": <DateTableCell date={"N/H"} />,
            "delivery-date": <DateTableCell date={new Date()} />,
        },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
        setIsModalOpen(true);
    };
    const handleOk = () => {
        setIsModalOpen(false);
    };
    const handleCancel = () => {
        setIsModalOpen(false);
    };
    const columns = [
        {
            title: "Код",
            dataIndex: "code",
            key: "code",
        },
        {
            title: "Дата",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Перевозчик",
            dataIndex: "transporter",
            key: "transporter",
        },
        {
            title: "Статус",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "Дата отправления",
            dataIndex: "departure-date",
            key: "departure-date",
        },
        {
            title: "Дата поступления",
            dataIndex: "delivery-date",
            key: "delivery-date",
        },
        {
            title: "",
            dataIndex: "",
            key: "",
        },
    ];

    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "0 40px",
                    gap: "20px",
                }}
            >
                <Row>
                    <Typography>
                        <Title
                            level={1}
                            style={{ fontWeight: "700", marginBottom: "0" }}
                        >
                            Отправки
                        </Title>

                        <Link
                            onClick={() => navigate(`/sendings`)}
                            style={{ color: "blue" }}
                        >
                            Отправка товаров
                        </Link>
                    </Typography>
                </Row>
                <Row>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",

                            gap: "20px",
                            width: "100%",
                        }}
                    >
                        <Row
                            style={{
                                display: "flex",
                                flexDirection: "row",
                                gap: "15px",
                                width: "100%",
                            }}
                        >
                            <Input
                                placeholder="Поиск"
                                style={{ maxWidth: "250px" }}
                            />
                            <Select
                                style={{
                                    maxWidth: "250px",
                                    width: "100%",
                                    height: "40px",
                                    lineHeight: "40px",
                                }}
                                placeholder="Сортировка"
                                optionFilterProp="children"
                                options={columns.map((item) => {
                                    return item.title !== ""
                                        ? {
                                              title: item.dataIndex,
                                              value: item.title,
                                          }
                                        : {};
                                })}
                            />
                            <Button
                                type="primary"
                                size={"large"}
                                style={{ backgroundColor: "#009650" }}
                                onClick={showModal}
                            >
                                Фильтры
                            </Button>
                        </Row>
                        <Button
                            type="primary"
                            onClick={() => navigate("/sendings/create")}
                            size={"large"}
                        >
                            Создать
                        </Button>
                    </div>
                </Row>
                <Table
                    columns={columns}
                    dataSource={sendings}
                    loading={isLoading}
                    rowKey={({ id }) => id}
                    onRow={(record) => ({
                        onClick: () => navigate(`/sendings/${record.id}`),
                    })}
                />
            </div>
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
                <RangePicker style={{ width: "100%" }} />
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
                            placeholder="Сортировка"
                            optionFilterProp="children"
                            options={columns.map((item) => {
                                return item.title !== ""
                                    ? {
                                          title: item.dataIndex,
                                          value: item.title,
                                      }
                                    : {};
                            })}
                        />
                    </div>
                    <div style={{ maxWidth: 190, width: "100%" }}>
                        <p>Статус</p>
                        <Select
                            style={{
                                maxWidth: "190px",
                                width: "100%",
                            }}
                            placeholder="Сортировка"
                            optionFilterProp="children"
                            options={columns.map((item) => {
                                return item.title !== ""
                                    ? {
                                          title: item.dataIndex,
                                          value: item.title,
                                      }
                                    : {};
                            })}
                        />
                    </div>
                </Row>
                <p>Дата отправки</p>
                <RangePicker style={{ width: "100%" }} />
                <p>Дата прибытия</p>
                <RangePicker style={{ width: "100%" }} />
            </Modal>
        </>
    );
}

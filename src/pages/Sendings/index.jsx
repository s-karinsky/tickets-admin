import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Row, Table, Typography, Input, Select, Switch } from "antd";
import { getSendingsList } from "../../redux/data";
import { BsArrowRepeat, BsCheck2Circle, BsTrash } from "react-icons/bs";
import { useState } from "react";
import { SendingsStatus } from "../../components/SendingsStatus";
import { DateTableCell } from "../../components/DateTableCell";
import { FilterModal } from "../../components/FilterModal";
import { InfoModal } from "../../components/InfoModal";

const { Title, Link } = Typography;
export let PropertyGap = 10;
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

    sendings = sendings.map((item) => {
        return {
            ...item,
            buttons: (
                <div style={{ display: "flex", gap: 10 }}>
                    <BsCheck2Circle size={17} color="green" />
                    <BsArrowRepeat size={17} color="" />
                    <BsTrash size={17} color="red" />
                </div>
            ),
        };
    });

    const props = {
        date: [new Date().toLocaleDateString(), "Дата отправки"],
        dateDispatch: [new Date().toLocaleDateString(), "Дата отправки"],
        dateReceipt: [new Date().toLocaleDateString(), "Дата поступления"],
        trasporter: ["Александр А. А.", "Перевозчик"],
        status: ["В обработке", "Статус"],
        countPlaces: [12, "Количество мест"],
        grossWeight: [288, "Вес брутто"],
        netWeight: [250, "Вес нетто"],
        note: [
            "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s..",
            "Примечание",
        ],
    };
    const [filterModalOpen, setFilterModalOpen] = useState(false);

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
            dataIndex: "buttons",
            key: "buttons",
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
                <Row
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-end",
                    }}
                >
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
                    <Switch checkedChildren="Авиа" unCheckedChildren="Авто" />
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
                                onClick={() => setFilterModalOpen(true)}
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
                    size="small"
                    columns={columns}
                    dataSource={sendings}
                    loading={isLoading}
                    rowKey={({ id }) => id}
                    onRow={(record) => ({
                        onClick: () => {
                            navigate(`/sendings/${record.code}`);
                        },
                    })}
                    style={{ overflow: "scroll" }}
                />
            </div>
            <FilterModal
                isModalOpen={filterModalOpen}
                handleOk={() => setFilterModalOpen(false)}
                handleCancel={() => setFilterModalOpen(false)}
                columns={columns.filter((item) => item.title != "")}
            />
        </>
    );
}

import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Row, Table, Typography, Input, Select, Checkbox } from "antd";
import { BsTrash } from "react-icons/bs";
import { BiInfoCircle, BiEdit } from "react-icons/bi";
import { AiOutlineMore } from "react-icons/ai";
import { useState } from "react";
import { DateTableCell } from "../../components/DateTableCell";
import { FilterModal } from "../../components/FilterModal";
import { Property } from "../../components/Property";
import { PropertyGap } from "../Sendings";
import CreateSendingModal from "../Sendings/CreateSendingModal";
import CreatePlaceModal from "./CreatePlaceModal";
const { Title, Link } = Typography;

export default function Sending({
    id = 1,
    props = {
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
    },
}) {
    const navigate = useNavigate();
    const isLoading = useSelector((state) => state.data.isLoading);
    const location = useLocation();
    //let places = useSelector(getPlacesList);
    let places = [
        {
            code: 1,
            date: <DateTableCell date={new Date()} />,
            client: "Александ В.",
            status: "Не назначено",
            count: 10,
            place: 12,
            rate: 1,
        },
        {
            code: 2,
            date: <DateTableCell date={new Date()} />,
            client: "рлександ В.",
            status: "Выдача со склада → Выдано",
            count: 23,
            place: 12,
            rate: 0,
        },
        {
            code: 3,
            date: <DateTableCell date={new Date()} />,
            client: "рлександ В.",
            status: "Выдача со склада → Выдано",
            count: 12,
            place: 12,
            rate: 1,
        },
        {
            code: 5,
            date: <DateTableCell date={new Date()} />,
            client: "рлександ В.",
            status: "Не назначено",
            count: 2,
            place: 12,
            rate: 12,
        },
    ];

    places = places.map((item) => {
        return {
            ...item,
            buttons: (
                <div style={{ display: "flex", gap: 10 }}>
                    <BiInfoCircle size={17} color="#141414" />
                    <AiOutlineMore size={17} color="#141414" />
                </div>
            ),
        };
    });
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [createPlace, setCreatePlace] = useState(false);
    const [nextPage, setNextPage] = useState(0);

    const columns = [
        {
            title: "Код",
            dataIndex: "code",
            key: "code",
        },
        {
            title: "Статус услуги",
            dataIndex: "status",
            key: "status",
        },
        {
            title: "Место",
            dataIndex: "place",
            key: "place",
        },
        {
            title: "Клиент",
            dataIndex: "client",
            key: "client",
        },
        {
            title: "Тариф",
            dataIndex: "rate",
            key: "rate",
        },
        {
            title: "Количество товара",
            dataIndex: "count",
            key: "count",
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
                        gap: 20,
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
                            Отправка{" "}
                            {location.pathname
                                .toString()
                                .split("/")
                                .slice(-1)
                                .join("/")}
                        </Title>
                        <Link
                            onClick={() => navigate(`/sendings`)}
                            style={{ color: "blue" }}
                        >
                            Отправка товаров <span> </span>
                        </Link>
                        &gt; Отправка{" "}
                        {location.pathname
                            .toString()
                            .split("/")
                            .slice(-1)
                            .join("/")}
                    </Typography>
                    <Row
                        style={{
                            gap: 20,
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "flex-end",
                            marginBottom: 20,
                        }}
                    >
                        <Button
                            style={{
                                gap: 10,
                                display: "flex",
                                alignItems: "center",
                            }}
                            type="primary"
                            size={"large"}
                            onClick={() => {
                                setNextPage(
                                    location.pathname
                                        .split("/")
                                        .slice(-1)
                                        .join("")
                                );
                                setInfoModalOpen(true);
                            }}
                        >
                            Редактировать
                            <BiEdit size={16} />
                        </Button>
                        <Button
                            size={"large"}
                            style={{
                                gap: 10,
                                display: "flex",
                                alignItems: "center",
                            }}
                            type="primary"
                            danger
                        >
                            Удалить
                            <BsTrash size={16} />
                        </Button>
                    </Row>
                </Row>

                <Row
                    style={{
                        display: "flex",
                        gap: `${PropertyGap}px`,
                        borderRadius: 20,
                        backgroundColor: "#FAFAFA",
                        padding: 20,
                        boxShadow: " 0px 2px 4px 0px #00000026",
                    }}
                >
                    {Object.values(props).map((item) => (
                        <Property title={item[1]} subtitle={item[0]} />
                    ))}
                </Row>
                <Row>
                    <Title
                        level={1}
                        style={{ fontWeight: "700", marginBottom: "0" }}
                    >
                        Места
                    </Title>
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
                            onClick={() => setCreatePlace(true)}
                            size={"large"}
                        >
                            Создать
                        </Button>
                    </div>
                </Row>
                <Table
                    columns={columns}
                    dataSource={places}
                    rowKey={({ id }) => id}
                    onRow={(record) => ({
                        onClick: () => {
                            navigate(`${location.pathname}/${record.code}`);
                        },
                    })}
                    size="small"
                    style={{ overflow: "scroll" }}
                    rowSelection={{
                        type: Checkbox,
                    }}
                />
            </div>
            <FilterModal
                isModalOpen={filterModalOpen}
                handleOk={() => setFilterModalOpen(false)}
                handleCancel={() => setFilterModalOpen(false)}
                columns={columns.filter((item) => item.title != "")}
            />
            <CreatePlaceModal
                title={`Создать место`}
                isModalOpen={createPlace}
                handleCancel={() => setCreatePlace(false)}
            />
            <CreateSendingModal
                title={`Отправление ${nextPage}`}
                isModalOpen={infoModalOpen}
                handleCancel={() => setInfoModalOpen(false)}
            />
        </>
    );
}

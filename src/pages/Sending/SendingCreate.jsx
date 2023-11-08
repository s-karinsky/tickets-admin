import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Row, Table, Typography, Input, Select, Checkbox } from "antd";
import { getSendingsList } from "../../redux/data";
import { BsTrash, BsCheck2Circle } from "react-icons/bs";
import { BiInfoCircle, BiEdit } from "react-icons/bi";
import { AiOutlineMore } from "react-icons/ai";
import { useState } from "react";
import { DateTableCell } from "../../components/DateTableCell";
import { FilterModal } from "../../components/FilterModal";
import { InfoModal } from "../../components/InfoModal";
import { Property } from "../../components/Property";
import { CreateSendingInput } from "../../components/CreateSendingInput";

const { Title, Link } = Typography;
export const SendingCreate = ({
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
}) => {
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

    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [nextPage, setNextPage] = useState(0);

    const onNextHandle = () => {
        navigate(`${location.pathname}/${nextPage}`);
    };

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
                <Row>
                    <Typography>
                        <Title
                            level={1}
                            style={{ fontWeight: "700", marginBottom: "0" }}
                        >
                            Создать отправку
                        </Title>
                        <Link
                            onClick={() => navigate(`/sendings`)}
                            style={{ color: "blue" }}
                        >
                            Отправка товаров <span> </span>
                        </Link>
                        &gt; Создать отправку
                    </Typography>
                </Row>
                <Row
                    style={{
                        gap: 20,
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
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
                    >
                        Сохранить
                        <BsCheck2Circle size={17} color="white" />
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
                <Row
                    style={{
                        display: "flex",
                        gap: "20px 10px",
                        padding: 20,
                    }}
                >
                    <CreateSendingInput />
                </Row>
                <Row>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            gap: "20px",
                            width: "100%",
                        }}
                    >
                        <Title
                            level={1}
                            style={{ fontWeight: "700", marginBottom: "0" }}
                        >
                            Места
                        </Title>
                        <Button
                            type="primary"
                            onClick={() => navigate("/sendings/1/create")}
                            size={"large"}
                        >
                            Добавить место
                        </Button>
                    </div>
                </Row>

                <Table
                    columns={columns}
                    dataSource={places}
                    rowKey={({ id }) => id}
                    onRow={(record) => ({
                        onClick: () => {
                            setNextPage(record.code);
                            setInfoModalOpen(true);
                        },
                    })}
                    style={{ overflow: "scroll" }}
                    rowSelection={{
                        type: Checkbox,
                    }}
                />
            </div>

            <InfoModal
                isModalOpen={infoModalOpen}
                content={props}
                handleCancel={() => setInfoModalOpen(false)}
                title={`Место №${nextPage}`}
                onNextHandle={onNextHandle}
            />
        </>
    );
};
export default SendingCreate;

import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Row, Table, Typography, Input, Select, Checkbox } from "antd";

import { BsTrash, BsCheck2Circle } from "react-icons/bs";
import { BiInfoCircle } from "react-icons/bi";
import { AiOutlineMore } from "react-icons/ai";
import { useState } from "react";
import { CreatePlaceInput } from "../../components/CreatePlaceInput";
import { InfoModal } from "../../components/InfoModal";

const { Title, Link } = Typography;

export default function PlaceCreate({
    id = 1,
    props = {
        date: [new Date().toLocaleDateString(), "Дата формирования"],
        client: ["Александр А. А.", "Клиент"],
        statusPlace: ["Прибыл", "Статус места"],
        count: [12, "Количество товара"],
        size: [220, "Размер"],
        statusService: ["Выдача со склада → Выдано", "Статус услуги"],
        dateReceipt: [new Date().toLocaleDateString(), "Дата поступления"],
        rate: ["Экспресс", "Тариф"],
        paymentType: ["Наличный", "Тип оплаты"],
        price: ["200$", "Цена за 1 кг"],
        netWeight: [250, "Вес нетто"],
        grossWeight: [288, "Вес брутто"],
        sum: ["5000 $", "Сумма товара"],
        sumToPay: ["1000$", "Сумма к оплате"],
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
            count: 2,
            name: "Black&White",
            brand: "Channel",
            article: "001",
            color: "blue",
            size: "XL",
            weight: 20,
            sum: 20,
            price: 10,
        },
        {
            code: 2,
            count: 2,
            name: "Black&White",
            brand: "Channel",
            article: "001",
            color: "blue",
            size: "XL",
            weight: 20,
            sum: 20,
            price: 10,
        },
        {
            code: 3,
            count: 2,
            name: "Black&White",
            brand: "Channel",
            article: "001",
            color: "blue",
            size: "XL",
            weight: 20,
            sum: 20,
            price: 10,
        },
        {
            code: 5,
            count: 2,
            name: "Black&White",
            brand: "Channel",
            article: "001",
            color: "blue",
            size: "XL",
            weight: 20,
            sum: 20,
            price: 10,
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
            title: "Наименование",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Марка",
            dataIndex: "brand",
            key: "brand",
        },
        {
            title: "Артикул",
            dataIndex: "article",
            key: "article",
        },
        {
            title: "Цвет",
            dataIndex: "color",
            key: "color",
        },
        {
            title: "Размер",
            dataIndex: "size",
            key: "size",
        },
        {
            title: "Вес нетто",
            dataIndex: "weight",
            key: "weight",
        },
        {
            title: "Количество",
            dataIndex: "count",
            key: "count",
        },
        {
            title: "Цена",
            dataIndex: "price",
            key: "price",
        },
        {
            title: "Сумма",
            dataIndex: "sum",
            key: "sum",
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
                            Создать место
                        </Title>
                        <div className="">
                            <Link
                                onClick={() => navigate(`/sendings`)}
                                style={{ color: "blue" }}
                            >
                                Отправка товаров <span> </span>&gt;
                            </Link>
                            <Link
                                onClick={() =>
                                    navigate(
                                        location.pathname
                                            .toString()
                                            .split("/")
                                            .slice(0, -1)
                                            .join("/")
                                    )
                                }
                                style={{ color: "blue" }}
                            >
                                <span> </span>Отправка<span> </span>
                                {location.pathname
                                    .toString()
                                    .split("/")
                                    .slice(-2, -1)
                                    .join("/")}
                                <span> </span>
                                &gt;<span> </span>
                            </Link>
                            Создать место
                        </div>
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

                        padding: 20,
                    }}
                >
                    <CreatePlaceInput />
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
                            Товары
                        </Title>
                        <Button
                            type="primary"
                            onClick={() => navigate("/sendings/1/1/create")}
                            size={"large"}
                        >
                            Добавить
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

                        //navigate(`${location.pathname}/${record.code}`),
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
                title={`Товар №${nextPage}`}
                onNextHandle={onNextHandle}
            />
        </>
    );
}

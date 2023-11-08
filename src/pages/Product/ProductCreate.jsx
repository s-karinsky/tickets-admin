import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Row, Table, Typography } from "antd";
import { getSendingsList } from "../../redux/data";
import { BsTrash, BsCheck2Circle } from "react-icons/bs";

import { CreateProductInput } from "../../components/CreateProductInput";

const { Title, Link } = Typography;

export default function ProductCreate({}) {
    const navigate = useNavigate();
    const isLoading = useSelector((state) => state.data.isLoading);
    const location = useLocation();
    //let places = useSelector(getPlacesList);

    return (
        <>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "0 40px 40px",

                    gap: "20px",
                }}
            >
                <Row>
                    <Typography>
                        <Title
                            level={1}
                            style={{ fontWeight: "700", marginBottom: "0" }}
                        >
                            Black & white / 00001
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
                                            .slice(0, -2)
                                            .join("/")
                                    )
                                }
                                style={{ color: "blue" }}
                            >
                                <span> </span>Отправка<span> </span>
                                {location.pathname
                                    .toString()
                                    .split("/")
                                    .slice(-3, -2)
                                    .join("/")}
                                <span> </span>
                                &gt;<span> </span>
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
                                Место <span> </span>
                                {location.pathname
                                    .toString()
                                    .split("/")
                                    .slice(-2, -1)
                                    .join("/")}
                            </Link>
                            <span> </span>&gt;<span> </span> Black&White / 00001
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
                        padding: 20,
                    }}
                >
                    <CreateProductInput />
                </Row>
            </div>
        </>
    );
}

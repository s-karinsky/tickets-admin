import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Row, Typography } from 'antd';
import { BsTrash } from 'react-icons/bs';
import { BiEdit } from 'react-icons/bi';
import { Property } from '../../components/Property';
import { PropertyGap } from '../Sendings';

const { Title, Link } = Typography;

export default function Product({
  id = 1,
  props = {
    date: [new Date().toLocaleDateString(), 'Дата формирования'],
    brand: ['Chanel', 'Марка'],
    statusPlace: ['Синий', 'Цвет'],
    size: ['XL', 'Размер'],
    material: ['Хлопок - 90%', 'Состав/материал'],
    customsClass: [123456789, 'ТН ВЭД ТС'],
    count: [12, 'Количество'],
    netWeight: [250, 'Вес нетто'],
    marking: ['Есть', 'Маркировка ЧЗ'],
    price: ['200$', 'Цена '],
    sum: ['5000 $', 'Сумма'],
    sertificate: [
      '№123 от 22.10.2023 до 22.10.2024',
      'Сертификат/Декларация о соответствии',
    ],
    note: [
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s..",
      'Примечание',
    ],
  },
}) {
  const navigate = useNavigate();
  const isLoading = useSelector((state) => state.data.isLoading);
  const location = useLocation();
  //let places = useSelector(getPlacesList)

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '0 40px 40px',

          gap: '20px',
        }}
      >
        <Row
          style={{
            gap: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 20,
          }}
        >
          <Typography>
            <Title
              level={1}
              style={{ fontWeight: '700', marginBottom: '0' }}
            >
              Black & white / 00001
            </Title>
            <div className=''>
              <Link
                onClick={() => navigate(`/sendings`)}
                style={{ color: 'blue' }}
              >
                Отправка товаров <span> </span>&gt;
              </Link>
              <Link
                onClick={() =>
                  navigate(
                    location.pathname
                      .toString()
                      .split('/')
                      .slice(0, -2)
                      .join('/')
                  )
                }
                style={{ color: 'blue' }}
              >
                <span> </span>Отправка<span> </span>
                {location.pathname
                  .toString()
                  .split('/')
                  .slice(-3, -2)
                  .join('/')}
                <span> </span>
                &gt;<span> </span>
              </Link>
              <Link
                onClick={() =>
                  navigate(
                    location.pathname
                      .toString()
                      .split('/')
                      .slice(0, -1)
                      .join('/')
                  )
                }
                style={{ color: 'blue' }}
              >
                Место <span> </span>
                {location.pathname
                  .toString()
                  .split('/')
                  .slice(-2, -1)
                  .join('/')}
              </Link>
              <span> </span>&gt;<span> </span> Black&White / 00001
            </div>
          </Typography>
          <Row
            style={{
              gap: 20,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}
          >
            <Button
              style={{
                gap: 10,
                display: 'flex',
                alignItems: 'center',
              }}
              type='primary'
              size={'large'}
              onClick={() =>
                navigate(
                  `${location.pathname
                    .split('/')
                    .slice(0, -1)
                    .join('/')}/create`
                )
              }
            >
              Редактировать
              <BiEdit size={16} />
            </Button>
            <Button
              size={'large'}
              style={{
                gap: 10,
                display: 'flex',
                alignItems: 'center',
              }}
              type='primary'
              danger
            >
              Удалить
              <BsTrash size={16} />
            </Button>
          </Row>
        </Row>

        <Row
          style={{
            display: 'flex',
            gap: `${PropertyGap}px`,
            borderRadius: 20,
            backgroundColor: '#FAFAFA',
            padding: 20,
            boxShadow: ' 0px 2px 4px 0px #00000026',
          }}
        >
          {Object.values(props).map((item) => (
            <Property title={item[1]} subtitle={item[0]} />
          ))}
        </Row>
      </div>
    </>
  );
}

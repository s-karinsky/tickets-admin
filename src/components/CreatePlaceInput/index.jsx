import React from 'react';
import { Form, Input, Select, DatePicker } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { PropertyGap } from '../../pages/Sendings';

export const CreatePlaceInput = () => {
    return (
        <Form
            style={{
                display: 'flex',
                gap: `${PropertyGap}px`,
                flexWrap: 'wrap',
                alignItems: 'flex-end',
            }}
        >
            <Select
                style={{
                    maxWidth: '250px',
                    width: '100%',
                    height: '40px',
                    lineHeight: '40px',
                }}
                placeholder='Клиент'
                options={[
                    { value: 'Александр', title: 'Aktr' },
                    { value: 'Владимир', title: 'Aktr' },
                ]}
            />
            <Select
                style={{
                    maxWidth: '250px',
                    width: '100%',
                    height: '40px',
                    lineHeight: '40px',
                }}
                placeholder='Статус места'
                optionFilterProp='children'
                options={[
                    { value: 'В обработке', title: '' },
                    { value: 'В пути', title: '' },
                ]}
            />
            <Select
                style={{
                    maxWidth: '250px',
                    width: '100%',
                    height: '40px',
                    lineHeight: '40px',
                }}
                placeholder='Статус услуги'
                optionFilterProp='children'
                options={[
                    { value: 'В обработке', title: '' },
                    { value: 'Выдано', title: '' },
                ]}
            />
            <Select
                style={{
                    maxWidth: '250px',
                    width: '100%',
                    height: '40px',
                    lineHeight: '40px',
                }}
                placeholder='Услуги'
                optionFilterProp='children'
                options={[
                    { value: 'В обработке', title: '' },
                    { value: 'Выдача со склада', title: '' },
                ]}
            />
            <Select
                style={{
                    maxWidth: '250px',
                    width: '100%',
                    height: '40px',
                    lineHeight: '40px',
                }}
                placeholder='Тариф'
                optionFilterProp='children'
                options={[
                    { value: 'Экспресс', title: '' },
                    { value: 'Эконом', title: '' },
                ]}
            />
            <Select
                style={{
                    maxWidth: '250px',
                    width: '100%',
                    height: '40px',
                    lineHeight: '40px',
                }}
                placeholder='Статус места'
                optionFilterProp='children'
                options={[
                    { value: 'Наличный', title: '' },
                    { value: 'Безналичный', title: '' },
                ]}
            />
            <div style={{ position: 'relative' }}>
                <div
                    style={{
                        paddingLeft: 10,
                        color: '#757575',
                    }}
                >
                    Дата отправки
                </div>
                <DatePicker size='large' />
            </div>
            <Input
                addonAfter='Цена за 1 кг, $'
                placeholder='10'
                size='large'
                style={{ maxWidth: '250px' }}
            />
            <Input
                addonAfter='Сумма товара, $'
                placeholder='10'
                size='large'
                style={{ maxWidth: '250px' }}
            />
            <Input
                addonAfter='Сумма оплаты, $'
                placeholder='10'
                size='large'
                style={{ maxWidth: '250px' }}
            />
            <Input
                addonAfter='Размер, см'
                placeholder='10'
                size='large'
                style={{ maxWidth: '250px' }}
            />
            <Input
                addonAfter='Вес нетто, кг'
                placeholder='10'
                size='large'
                style={{ maxWidth: '250px' }}
            />
            <Input
                addonAfter='Вес брутто, кг'
                placeholder='10'
                size='large'
                style={{ maxWidth: '250px' }}
            />
            <Input
                addonAfter='Количество товара'
                placeholder='10'
                size='large'
                style={{ maxWidth: '250px' }}
            />
            <TextArea placeholder='Примечание' rows={4} />
        </Form>
    );
};
export default CreatePlaceInput;

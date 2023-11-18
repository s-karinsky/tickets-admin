import React from 'react';
import {
    Row,
    Typography,
    Select,
    Modal,
    DatePicker,
    Button,
    Form,
    Input,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { PropertyGap } from '../../pages/Sendings';
const { Title } = Typography;
const { RangePicker } = DatePicker;
export const CreateSendingModal = ({
    isModalOpen,
    handleCancel,
    content,
    title,
}) => {
    return (
        <Modal
            style={{ maxWidth: 800 }}
            width={'100%'}
            title={
                <Title
                    level={2}
                    style={{
                        fontWeight: '700',
                        marginBottom: '0',
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
                    key='1'
                    type='primary'
                    style={{ backgroundColor: 'rgb(0, 150, 80)' }}
                    onClick={() => handleCancel()}
                >
                    Сохранить
                </Button>,
            ]}
        >
            <Row
                style={{
                    display: 'flex',
                    gap: `${PropertyGap}px`,
                    padding: '20px 0',
                }}
            >
                <Form
                    style={{
                        display: 'flex',
                        gap: `${PropertyGap}px`,
                        flexWrap: 'wrap',
                    }}
                >
                    <RangePicker placeholder={['От', 'До']} size='large' />
                    <RangePicker
                        placeholder={['От', 'До']}
                        size='large'
                        style={{
                            maxWidth: '250px',
                            width: '100%',
                        }}
                    />
                    <Select
                        style={{
                            maxWidth: '250px',
                            width: '100%',
                            height: '40px',
                            lineHeight: '40px',
                        }}
                        placeholder='Перевозчик'
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
                        placeholder='Статус'
                        optionFilterProp='children'
                        options={[
                            { value: 'В обработке', title: '' },
                            { value: 'В пути', title: '' },
                        ]}
                    />
                    <Input
                        addonAfter='Количество мест'
                        placeholder='10'
                        style={{ maxWidth: '250px' }}
                        size={'large'}
                    />
                    <Input
                        addonAfter='Вес нетто, кг'
                        placeholder='10'
                        style={{ maxWidth: '250px' }}
                        size={'large'}
                    />
                    <Input
                        addonAfter='Вес брутто, кг'
                        placeholder='10'
                        style={{ maxWidth: '250px' }}
                        size={'large'}
                    />
                    <TextArea placeholder='Примечание' rows={4} />
                </Form>
            </Row>
        </Modal>
    );
};
export default CreateSendingModal;

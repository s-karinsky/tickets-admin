import React from 'react';
import { Form, Input, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { PropertyGap } from '../../pages/Sendings';

export const CreateSendingInput = () => {
  return (
    <Form
      style={{
        display: 'flex',
        gap: `${PropertyGap}px`,
        flexWrap: 'wrap',
      }}
    >
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
  );
};

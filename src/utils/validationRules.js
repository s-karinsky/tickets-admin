export const required = (message = 'Обязательное поле') => (
  [
    { required: true, message }
  ]
)

export const numberRange = ({ min, max }, message = `Введите число ${min ? `от ${min} ` : ''}${max ? `до ${max}` : ''}`) => (
  [
    {
      type: 'number',
      min,
      max,
      message
    }
  ]
)
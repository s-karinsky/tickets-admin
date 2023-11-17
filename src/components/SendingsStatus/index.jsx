import React from 'react'
import { BsBox, BsTruck } from 'react-icons/bs';
import { BiHomeAlt } from 'react-icons/bi'

export const SendingsStatus = ({ status = 0 }) => {
  let positionCar = { left: 15, flexDirection: 'row' }
  let progress = { width: 0, backgroundColor: '#141414' }
  let textCar = 'Формирование'
  switch (status) {
    case 1:
      positionCar = { left: 63, flexDirection: 'row-reverse' }
      progress = { width: '50%', backgroundColor: '#4D89FF' }
      textCar = 'В пути'
      break
    case 2:
      positionCar = { right: 15, flexDirection: 'row-reverse' }
      progress = { width: '100%', backgroundColor: '#009650' }
      textCar = 'Поступила'
      break
    case 3:
      positionCar = { right: 20, flexDirection: 'row-reverse' }
      progress = { width: '90%', backgroundColor: '#FF3030' }
      textCar = 'Приостановлен'
      break
    default:
      break
  }
  return (
    <div style={{ width: '200px', minHeight: 24 }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <BsBox size={14} />

        <div
          style={{
            position: 'absolute',
            top: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            ...positionCar,
          }}
        >
          <BsTruck size={14} />
          <div
            style={{
              fontSize: 11,
              lineHeight: '13px',
              fontWeight: 500,
              color: progress.backgroundColor,
            }}
          >
            {textCar}
          </div>
        </div>

        <BiHomeAlt size={14} />
      </div>
      <div
        style={{
          width: '100%',
          height: 5,
          borderRadius: 2,
          backgroundColor: '#D9D9D9',
          marginTop: 5,
        }}
      >
        <div
          style={{
            height: 5,
            borderRadius: 2,
            ...progress,
          }}
        ></div>
      </div>
    </div>
  )
}

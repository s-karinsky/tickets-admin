import React from 'react'
import { BsBox, BsTruck } from 'react-icons/bs'
import { BiHomeAlt } from 'react-icons/bi'
import './styles.css'

export const SendingsStatus = ({ status = 0, onClick = () => false }) => {
  const text = ['Формирование', 'В пути', 'Поступила', 'Приостановлен']
  const statusClasses = ['creating', 'progress', 'done', 'pause']

  return (
    <div
      className={`sending-status sending-status_${statusClasses[status]} sending-status_active`}
      onClick={onClick}
    >
      <div className='sending-status__preview'>
        <BsBox size={14} />
        <div className='sending-status__car'>
          <BsTruck size={14} />
          <div className='sending-status__text'>
            {text[status]}
          </div>
        </div>
        <div className='sending-status__hover-text'>
          Изменить статус
        </div>

        <BiHomeAlt size={14} />
      </div>
      <div className='sending-status__progress'>
        <div className='sending-status__progress-line'></div>
      </div>
    </div>
  )
}

import { useMemo } from 'react'
import { Button, Table } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useRoles } from '../../utils/hooks'
import Wrapper from '../../components/Wrapper'
import { NEW_ID } from '../../consts'

export const ROOT_PATH = '/roles'

export default function Roles() {
  const navigate = useNavigate()
  const roles = useRoles()

  const columns = useMemo(() => [
    {
      title: 'Код',
      dataIndex: 'id_role'
    },
    {
      title: 'Роль',
      dataIndex: 'name_ru'
    }
  ], [])

  return (
    <Wrapper
      title='Роли пользователей'
      breadcrumbs={[{ title: 'Роли пользователей' }]}
      buttons={[
        <Button size='large' type='primary' onClick={() => navigate(`${ROOT_PATH}/${NEW_ID}`)}>Создать</Button>
      ]}
    >
      <Table
        columns={columns}
        dataSource={roles.data}
        loading={roles.isLoading}
        rowKey='id_role'
        onRow={record => ({
          onClick: (e) => {
            if (e.detail === 2) {
              navigate(`${ROOT_PATH}/${record.id_role}`)
            }
          },
        })}
      />
    </Wrapper>
  )
}
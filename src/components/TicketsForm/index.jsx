import { useMemo, useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Col,
  Row,
  Form,
  Button,
  Select,
  Modal,
  Tooltip,
  Input,
  InputNumber,
  Typography,
  Table
} from 'antd'
import { PlusCircleFilled, MinusCircleOutlined, QuestionCircleOutlined  } from '@ant-design/icons'
import dayjs from 'dayjs'
import InputFile from '../InputFile'
import axios from '../../utils/axios'
import { capitalizeFirstLetter, toBase64, getFileExt } from '../../utils/utils'
import { getCurrencyList, getDefaultCurrency } from '../../redux/config'
import { getSchedule, getMatch } from '../../redux/data'
import { fetchTicketGroups, fetchTicketsFiles, getMatchTickets } from '../../redux/tickets'

const { Text } = Typography

const getTicketsColumns = (getFile = () => {}) => ([
  {
    title: 'Block',
    dataIndex: 'block',
    key: 'block'
  },
  {
    title: 'Row',
    dataIndex: 'row',
    key: 'row'
  },
  {
    title: 'Seat',
    dataIndex: 'seat',
    key: 'seat'
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    render: (price, { currency }) => `${price} ${currency || ''}`
  },
  {
    title: 'File',
    dataIndex: 'isFile',
    key: 'isFile',
    render: (isFile, { tripId, seatId }) => isFile && <Typography.Link onClick={e => {
      e.stopPropagation()
      getFile(tripId, seatId)
    }}>File</Typography.Link>
  },
  {
    title: 'Status',
    dataIndex: 'soldToUser',
    key: 'soldToUser',
    render: user => user ? (<Text type='danger'>Sold</Text>) : (<Text type='success'>Available</Text>)
  }
])

const getOptions = obj => Object.values(obj)
  .map(item => ({ label: item.en, value: item.id }))
  .sort((item1, item2) => item1.label > item2.label ? 1 : -1)

function TicketFormRow({
  isSold,
  tripId,
  name,
  stadiumBlocks,
  showRemoveButton,
  remove,
  isMultiple
}) {
  const [ isSingleSeat, setIsSingleSeat ] = useState(true)
  const handleChangeSeats = useCallback(e => {
    if (!e.target) return
    const { value } = e.target
    setIsSingleSeat(!value || !!Number(value))
  }, [])
  const currencyList = useSelector(getCurrencyList)
  const defaultCurrency = useSelector(getDefaultCurrency)

  const SeatsInput = tripId ? InputNumber : Input

  const getCurrencies = name => (
    <Form.Item name={[name, 'currency']} noStyle>
      <Select defaultValue={defaultCurrency}>
        {currencyList.map(currency => (
          <Select.Option
            value={currency.code}
            title={currency.ru}
          >
            {currency.code}
          </Select.Option>
        ))}
      </Select>
    </Form.Item>
  )

  return (
    <Row>
      <Col
        span={4}
      >
        <Form.Item
          label='Block'
          name={[name, 'block']}
          rules={[{ required: true, message: 'Please input block' }]}
        >
          {stadiumBlocks.length > 0 ? 
            <Select
              size='large'
              placeholder='Block'
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={stadiumBlocks}
              style={{ width: '100%' }}
              disabled={isSold}
              showSearch
            /> :
            <Input
              size='large'
              placeholder='Block'
              style={{ width: '100%' }}
              disabled={isSold}
            />
          }
        </Form.Item>
      </Col>
      <Col span={3} offset={1}>
        <Form.Item
          label='Row'
          name={[name, 'row']}
          rules={[{ required: true, message: 'Please input row' }]}
        >
          <InputNumber
            style={{ width: '100%' }}
            size='large'
            min={1}
            disabled={isSold}
          />
        </Form.Item>
      </Col>
      <Col span={4} offset={1}>
        <Form.Item
          label={
            !tripId ? <Tooltip title='You can enter multiple values separated by commas (1,2,3), or a range of values separated by a hyphen (1-4)'>
              <span>Seats <QuestionCircleOutlined /></span>
            </Tooltip> : 'Seats'
          }
          name={[name, 'seats']}
          rules={[{ required: true, message: 'Please input seats' }]}
        >
          <SeatsInput
            size='large'
            style={{ width: '100%' }}
            disabled={isSold}
            onChange={handleChangeSeats}
          />
        </Form.Item>
      </Col>
      <Col span={4} offset={1}>
        <Form.Item
          label='Price'
          name={[name, 'price']}
          rules={[{ required: true, message: 'Please input price' }]}
        >
          <InputNumber
            size='large'
            disabled={isSold}
            addonAfter={getCurrencies(name)}
          />
        </Form.Item>
      </Col>
      <Col span={4} offset={1}>
        <Form.Item
          label={
            <Tooltip title='You can upload file for single seat only. Also you can upload file after creating ticket'>
              <span>File <QuestionCircleOutlined /></span>
            </Tooltip>
          }
          name={[name, 'file']}
        > 
          <InputFile
            label='Select file'
            disabled={!isSingleSeat}
          />
        </Form.Item>
      </Col>
      {isMultiple && <Col span={1}>
        <MinusCircleOutlined
          style={{
            margin: '42px 0 0 10px',
            visibility: showRemoveButton ? 'visible' : 'hidden'
          }}
          onClick={() => remove(name)}
        />
      </Col>}
    </Row>
  )
}

function AddTicketsModal({
  initialValues = {
    tickets: [{}]
  },
  isOpen,
  isMultiple,
  stadiumBlocks,
  onSubmit = () => {},
  hideModal = () => {}
}) {
  const [ confirmLoading, setConfirmLoading ] = useState(false)
  const [ form ] = Form.useForm()
  const { isSold, tripId } = initialValues
  
  return (
    <Modal
      width={800}
      title='Add tickets'
      okText='Save'
      open={isOpen}
      confirmLoading={confirmLoading}
      onOk={() => {
        setConfirmLoading(true)
        form
          .validateFields()
          .then((values) => {
            onSubmit(values, tripId)
            form.resetFields()
            hideModal()
          })
          .catch((info) => {
            console.log('Validate Failed:', info);
          })
      }}
      onCancel={() => {
        form.resetFields()
        hideModal()
      }}
    >
      <Form
        form={form}
        layout='vertical'
        initialValues={initialValues}
      >
        <Form.List name='tickets'>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name }) => (
                <TicketFormRow
                  key={key}
                  isSold={isSold}
                  name={name}
                  stadiumBlocks={stadiumBlocks}
                  tripId={tripId}
                  isMultiple={isMultiple}
                  showRemoveButton={fields.length > 1}
                  remove={remove}
                />
              ))}
              {isMultiple && <Form.Item>
                <Button
                  onClick={() => add()}
                  size='large'
                  block
                >
                  One more block
                </Button>
              </Form.Item>}
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  )
}

function TicketsList({ matchId, onRowClick = () => {} }) {
  const dispatch = useDispatch()
  const match = useSelector(state => getMatch(state, matchId))
  const { tickets } = useSelector(state => getMatchTickets(state, matchId)) || {}
  const tripsId = useMemo(() =>
    (tickets || []).map(item => item.tripId).filter((item, i, arr) => arr.indexOf(item) === i)
  , [tickets])

  useEffect(() => {
    if (!tripsId.length) return
    dispatch(fetchTicketsFiles(tripsId))
  }, [tripsId])

  const getFile = useCallback(async (tripId, seatId) => {
    const { team1, team2, datetime } = match
    const [ stadium, block, row, seat ] = seatId.split(';')
    const resp = await axios.postWithAuth(`/trip/get/${tripId}/ticket/read`, { seat: seatId }, { responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([resp.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = `${dayjs(datetime).format('DD-MM-YYYY')} ${team1.en} vs ${team2.en} block ${block} row ${row} seat ${seat}.pdf`
    document.body.appendChild(link)
    link.click()
    link.parentElement.removeChild(link)
  }, [match])

  return (
    <Table
      columns={getTicketsColumns(getFile)}
      dataSource={tickets}
      rowKey={({ block, row, seat }) => ([block, row, seat].join(';'))}
      onRow={record => ({
          onClick: onRowClick(record)
      })}
    />
  )
}

export default function TicketsForm({
  matchId,
  isAdmin
}) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const match = useSelector(state => getMatch(state, matchId))
  const defaultCurrency = useSelector(getDefaultCurrency)
  const [ tournamentValue, setTournamentValue ] = useState(match?.tournament.id)
  const [ stadiumBlocks, setStadiumBlocks ] = useState([])
  const [ stadiumLoaded, setStadiumLoaded ] = useState(false)
  const [ isShowModal, setShowModal ] = useState(false)
  const [ formValues, setFormValues ] = useState()

  const initialValues = !matchId ? {} : {
    tournament: match?.tournament.id,
    match: match?.id
  }

  const handleAddTickets = useCallback(async (values, initialTrip) => {
    const { tickets } = values
    const stadiumId = match.stadium || match.team1?.stadium?.id
    const files = []
    const t_options = tickets.reduce((acc, ticket, i) => {
      const { block, row, seats, price, currency = defaultCurrency, file } = ticket

      if (file) {
        files.push({ block, row, seat: seats, file })
      }

      const key = i + 1
      const prefix = `${stadiumId};${block};${row}`
      acc.price[key] = !currency ? price : `${price} ${currency }`
      String(seats).replaceAll(' ', '').split(',').forEach(seat => {
        const range = seat.split('-').map(Number)
        if (range.length === 2) {
          const min = Math.min(...range)
          const max = Math.max(...range)
          for (let j = min; j <= max; j++) {
            acc.seats_sold[`${prefix};${j}`] = key
          }
        } else {
          acc.seats_sold[`${prefix};${seat}`] = key
        }
      })
      return acc
    }, { seats_sold: {}, price: {} })
    const t_start_address = `sc_id\u0000${match.id}`
    const data = JSON.stringify({ t_options, t_start_address })
    
    try {
      const { data: resposneData } = await axios.postWithAuth('/trip', { data })
      const filesBase64 = await Promise.all(files.map(data => toBase64(data.file)))
      const filesData = filesBase64.map((base64, i) => ({
        base64,
        seat: `${stadiumId};${files[i].block};${files[i].row};${files[i].seat}`,
        'extW.dot': getFileExt(files[i].file.name, true)
      }))
      const t_id = initialTrip || resposneData.data.t_id
      const params = new URLSearchParams()
      params.append('data', JSON.stringify(filesData))
      await axios.postWithAuth(`/trip/get/${t_id}/ticket/write`, params)
      dispatch(fetchTicketGroups)
    } catch (e) {
      console.error(e)
    }
  }, [match, defaultCurrency])

  const handleRowClick = useCallback((record) => () => {
    if (isAdmin) return
    setFormValues({
      tripId: record.tripId,
      isSold: !!record.soldToUser,
      tickets: [{
        block: record.block,
        row: record.row,
        seats: record.seat,
        currency: record.currency,
        price: parseInt(record.price)
      }]
    })
    setShowModal(true)
  }, [isAdmin])

  const tournaments = useSelector(state => state.data.tournaments)
  const schedule = useSelector(getSchedule)

  useEffect(() => {
    if (!match) return
    setStadiumBlocks([])
    setStadiumLoaded(false)
    const stadiumId = match.stadium?.id || match.team1?.stadium?.id
    axios.post(`/data?fields=1&key=${stadiumId}`)
      .then(({ data }) => {
        const { scheme } = data.data.data.stadiums[stadiumId] || {}
        try {
          const jsonScheme = JSON.parse(scheme.replaceAll('\'', '"'))
          const { sections } = jsonScheme
          const blocks = Object.keys(sections).map(section => {
            const label = capitalizeFirstLetter(section.split('-').join(' '))
            const options = Object.keys(sections[section].blocks).map(block => ({
              label: block.toUpperCase(),
              value: block
            }))
            return { label, options }
          })
          setStadiumBlocks(blocks)
        } catch (e) {
          console.error(e)
        }
        setStadiumLoaded(true)
      })
      .catch(e => console.error(e))
  }, [match])

  const tournamentsOptions = useMemo(() => getOptions(tournaments), [tournaments])
  const matchesOptions = useMemo(
    () => Object.values(schedule)
      .filter(item => item.tournament.id === tournamentValue)
      .map(item => ({ label: `${dayjs(item.datetime).format('DD.MM.YY')} ${item.team1.en} — ${item.team2.en}`, value: item.id })),
    [schedule, tournamentValue]
  )

  return (
    <>
      <Form
        layout='vertical'
        onFinish={values => {

        }}
        initialValues={initialValues}
      >
        <Row style={{ margin: '20px 20px 0 20px' }}>
          <Col
            span={11}
          >
            <Form.Item
              label='Tournament'
              name='tournament'
              rules={[{ required: true, message: 'Please input tournament' }]}
            >
              <Select
                size='large'
                placeholder='Tournament'
                onChange={setTournamentValue}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={tournamentsOptions}
                style={{ width: '100%' }}
                showSearch
              />
            </Form.Item>
          </Col>
          <Col span={1} />
          <Col span={11}>
            <Form.Item
              label='Match'
              name='match'
              rules={[{ required: true, message: 'Please input match' }]}
            >
              <Select
                size='large'
                placeholder='Match'
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={matchesOptions}
                disabled={!tournamentValue}
                style={{ width: '100%' }}
                onSelect={value => navigate(`/tickets/${value}`)}
                showSearch
              />
            </Form.Item>
          </Col>
        </Row>
        {stadiumLoaded && !isAdmin &&
          <>
            <Row style={{ margin: '20px 0 0 20px' }}>
              <Col>
                <Button
                  type='primary'
                  icon={<PlusCircleFilled />}
                  onClick={() => setShowModal(true)}
                >
                  Add tickets
                </Button>
              </Col>
            </Row>
          </>
        }
      </Form>
      {isShowModal && <AddTicketsModal
        initialValues={formValues}
        stadiumBlocks={stadiumBlocks}
        onSubmit={handleAddTickets}
        hideModal={() => {
          setShowModal(false)
          setFormValues()
        }}
        isMultiple={!formValues || !formValues.tripId}
        isOpen
      />}
      {!!matchId &&
        <TicketsList
          matchId={matchId}
          onRowClick={handleRowClick}
        />
      }
    </>
  )
}
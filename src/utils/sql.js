const SQL_FUNCS = ['year', 'sum']
const isSqlFunc = str => {
  return SQL_FUNCS.reduce((res, func) => res || str.toLowerCase().indexOf(func) === 0, false)
}

const toPairs = obj => Object.keys(obj).reduce((acc, key) => {
  let field
  const path = key.split('.')
  if (path.length > 1 && path[0] === '$') {
    field = `JSON_EXTRACT(${path[1]}, '$.${path.slice(2).join('.')}')`
  } else {
    field = isSqlFunc(key) || key.includes('.') ? key : `\`${key}\``
  }
  let value = obj[key]
  if (value === null || value === undefined) return acc
  if (typeof value === 'string' && value !== 'NULL' && !isSqlFunc(value)) {
    value = `'${value}'`
  }
  return [...acc, [field, value]]
}, [])

/**
 *  Генерация строки sql-запроса select
 *  @param {string} table - Название таблицы
 *  @param {(string|array)} [field='*'] - Список полей для выборки
 *  @param {object} [params] - Параметры запроса
 *  @param {(string|object)} [params.where] - Строка или объект, объект преобразуется в вид "ключ=значение".
 *                                            Если ключ начинается с $., то оборачивается в ф-цию JSON_EXTRACT,
 *                                            в первый аргумент которой подставляется строка от $. до следующей
 *                                            точки, а во второй вся строка после второй точки
 *
 */
export const sqlSelect = (
  table,
  fields = '*',
  {
    where,
    leftJoin,
    groupBy,
    orderBy
  } = {}
) => {
  let sql = `SELECT ${[].concat(fields).join(',')} FROM ${table}`
  if (leftJoin) {
    if (typeof leftJoin === 'string') {
      sql = `${sql} LEFT JOIN ${leftJoin}`
    } else {
      Object.keys(leftJoin).forEach(key => {
        let ljStr = ` LEFT JOIN ${key}`
        if (typeof leftJoin[key] === 'string') ljStr += ` ON ${leftJoin[key]}`
        else {
          const ljKeys = toPairs(leftJoin[key]).map(item => item.join('=')).join(' AND ')
          ljStr += ` ON ${ljKeys}`
        }
        sql += ljStr
      })
    }
  }
  if (where) {
    if (typeof where === 'string') {
      sql = `${sql} WHERE ${where}`
    } else {
      const whereArr = toPairs(where).map(item => item.join('='))
      sql = `${sql} WHERE ${whereArr.join(' AND ')}`
    }
  }
  if (groupBy) {
    sql += ` GROUP BY ${groupBy}`
  }
  if (orderBy) {
    sql += ` ORDER BY ${orderBy}`
  }
  return sql
}

export const sqlInsert = (table, values) => {
  if (Array.isArray(values)) {
    return `INSERT INTO ${table} VALUES (${values.map(val => typeof val === 'string' && val !== 'NULL' ? `'${val}'` : val).join(', ')})`
  }

  const [ fields, vals ] = Object.keys(values).reduce((acc, key) => {
    acc[0] = acc[0].concat(`\`${key}\``)
    let value = values[key] ?? ''
    if (typeof value === 'string' && value !== 'NULL') {
      value = `'${value}'`
    }
    acc[1] = acc[1].concat(value)
    return acc
  }, [[], []])
  return `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${vals.join(', ')})`
}

export const sqlUpdate = (table, values, where) => {
  const set = Object.keys(values).map(key => {
    const val = typeof values[key] === 'string' && values[key] !== 'NULL' ? `'${values[key]}'` : values[key]
    return `\`${key}\`=${val}`
  }).join(',')
  return `UPDATE ${table} SET ${set} WHERE ${where}`
}

import { createSelector } from 'reselect'

export const getDefaultCurrency = createSelector(
  state => state.config.data?.currency,
  currency => currency.default
)

export const getCurrencyList = createSelector(
  state => state.config.data?.currency || {},
  currency => Object.values(currency.map)
)

export const getLang = createSelector(
  state => state.config.data?.langs,
  (state, key) => key,
  (langs, key) => key ? langs[key] : Object.values(langs)
)

const emptyLang = {}

export const getLangValue = createSelector(
  state => state.config.data?.langValues,
  (state, key) => key,
  (values, key) => key ? (values[key] || emptyLang) : values
)

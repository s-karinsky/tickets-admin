import { createSelector } from 'reselect'

export const getDefaultCurrency = createSelector(
  state => state.config.data?.currency,
  currency => currency.default
)

export const getCurrencyList = createSelector(
  state => state.config.data?.currency || {},
  currency => Object.values(currency.map)
)
import { parseAsArrayOf, parseAsInteger, parseAsString } from 'nuqs'

export const UNCATEGORISED = 'none'

export const transactionFilterParams = {
  q: parseAsString.withDefault(''),
  categories: parseAsArrayOf(parseAsString).withDefault([]),
  accounts: parseAsString.withDefault(''),
  method: parseAsString.withDefault(''),
  page: parseAsInteger.withDefault(1),
}

import type { DecimalRejection } from '@/lib/utils/decimal'

type Translate = (key: string, values?: Record<string, number>) => string

export interface DecimalFieldMessages {
  positive: string
  decimals: string
}

export const QUANTITY_MESSAGES: DecimalFieldMessages = {
  positive: 'holdings.validation.mustBePositive',
  decimals: 'holdings.validation.maxDecimals',
}

export const PURCHASE_PRICE_MESSAGES: DecimalFieldMessages = {
  positive: 'holdings.validation.mustBeZeroOrPositive',
  decimals: 'holdings.validation.maxDecimals',
}

export const THRESHOLD_MESSAGES: DecimalFieldMessages = {
  positive: 'holdings.validation.invalidNumber',
  decimals: 'holdings.validation.maxDecimals',
}

export function decimalErrorMessage(
  t: Translate,
  reason: DecimalRejection,
  limits: { scale: number; integerDigits: number },
  messages: DecimalFieldMessages,
): string {
  switch (reason) {
    case 'format':
      return t('holdings.validation.invalidNumber')
    case 'scale':
      return t(messages.decimals, { max: limits.scale })
    case 'integerDigits':
      return t('holdings.validation.maxIntegerDigits', { max: limits.integerDigits })
    case 'empty':
    case 'notPositive':
      return t(messages.positive)
  }
}

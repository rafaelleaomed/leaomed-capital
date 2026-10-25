export type PersistableTransactionEdit = {
  description?: string
  amount?: number
  date?: string
  accountOrCard?: string
  category?: string
  subcategory?: string
  subdivision?: string
  investmentAsset?: string
  investmentAction?: 'APORTE' | 'RESGATE'
  isFixed?: boolean
  isIgnored?: boolean
}

type TransactionEditBaseline = Pick<
  PersistableTransactionEdit,
  'accountOrCard' | 'subdivision' | 'investmentAsset' | 'investmentAction'
>

const normalizedOptional = (value: string | undefined) => value || undefined

export function buildPersistedTransactionUpdate(
  id: string,
  original: TransactionEditBaseline,
  updates: PersistableTransactionEdit
) {
  const unsupportedChanged =
    updates.accountOrCard !== undefined && updates.accountOrCard !== original.accountOrCard ||
    normalizedOptional(updates.subdivision) !== normalizedOptional(original.subdivision) ||
    normalizedOptional(updates.investmentAsset) !== normalizedOptional(original.investmentAsset) ||
    normalizedOptional(updates.investmentAction) !== normalizedOptional(original.investmentAction)

  if (unsupportedChanged) {
    throw new Error('A conta, subdivisão ou vínculo de investimento ainda não pode ser alterado neste lançamento.')
  }

  return {
    id,
    description: updates.description,
    amount: updates.amount,
    date: updates.date,
    category: updates.category,
    subcategory: updates.subcategory,
    is_fixed: updates.isFixed,
    is_ignored: updates.isIgnored
  }
}

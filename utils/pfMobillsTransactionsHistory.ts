// Private transaction history belongs in authenticated persistence, never in a client module.
import { GranularTransaction } from './granularTransactionStore'

export const PF_MOBILLS_REAL_TRANSACTIONS: GranularTransaction[] = []

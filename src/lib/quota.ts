export interface QuotaUsage {
  quota: number | null
  used: number
  remaining: number
  isFull: boolean
  isUnlimited: boolean
}

export function isUnlimitedQuota(quota: number | null | undefined): boolean {
  return quota === null || quota === undefined || quota <= 0
}

export function getQuotaUsage({
  quota,
  used,
}: {
  quota: number | null | undefined
  used: number
}): QuotaUsage {
  const normalizedUsed = Math.max(0, used)

  if (isUnlimitedQuota(quota)) {
    return {
      quota: null,
      used: normalizedUsed,
      remaining: Number.POSITIVE_INFINITY,
      isFull: false,
      isUnlimited: true,
    }
  }

  const finiteQuota = quota as number
  const remaining = Math.max(0, finiteQuota - normalizedUsed)

  return {
    quota: finiteQuota,
    used: normalizedUsed,
    remaining,
    isFull: remaining === 0,
    isUnlimited: false,
  }
}

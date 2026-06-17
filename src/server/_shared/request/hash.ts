import crypto from 'node:crypto'

export function hashRequestValue(value: string) {
  return crypto
    .createHash('sha256')
    .update(value.trim().toLowerCase())
    .digest('hex')
}


export type PersonId = 'riya' | 'meena' | 'arjun' | 'kavya' | 'ramesh' | 'custom'

export interface Person {
  id: PersonId
  name: string
  upiId: string
  app: string
  /** Main outfit colour used in the cartoon. */
  color: string
  role: 'customer' | 'merchant'
}

export const PEOPLE: Record<Exclude<PersonId, 'custom'>, Person> = {
  riya: { id: 'riya', name: 'Riya', upiId: 'riya@ybl', app: 'PhonePe', color: '#E85D9A', role: 'customer' },
  meena: { id: 'meena', name: 'Meena', upiId: 'meena@okaxis', app: 'Google Pay', color: '#2E9E6A', role: 'customer' },
  arjun: { id: 'arjun', name: 'Arjun', upiId: 'arjun@ptyes', app: 'Paytm UPI', color: '#3B6FD8', role: 'customer' },
  kavya: { id: 'kavya', name: 'Kavya', upiId: 'kavya@oksbi', app: 'Google Pay', color: '#E8A21D', role: 'customer' },
  ramesh: { id: 'ramesh', name: 'Ramesh (shop owner)', upiId: 'ramesh@ptyes', app: 'Paytm UPI', color: '#F4F1EA', role: 'merchant' },
}

export const FREE_PLAY_PEOPLE: Person[] = [PEOPLE.riya, PEOPLE.arjun, PEOPLE.meena, PEOPLE.ramesh]

export function appForHandle(upiId: string): string {
  const h = (upiId.split('@')[1] ?? '').toLowerCase()
  if (/^pt(yes|axis|hdfc|sbi)$/.test(h) || h === 'paytm') return 'Paytm UPI'
  if (['ybl', 'ibl', 'axl'].includes(h)) return 'PhonePe'
  if (h.startsWith('ok')) return 'Google Pay'
  return 'UPI app'
}

export function customPerson(upiId: string): Person {
  const name = upiId.split('@')[0] || 'Customer'
  return {
    id: 'custom',
    name: name.charAt(0).toUpperCase() + name.slice(1),
    upiId,
    app: appForHandle(upiId),
    color: '#7A5AC8',
    role: 'customer',
  }
}

export type PersonId = 'riya' | 'meena' | 'arjun' | 'kavya' | 'ramesh'

export interface Person {
  id: PersonId
  name: string
  upiId: string
  app: string
  /** Main outfit colour used in the cartoon. */
  color: string
  role: 'customer' | 'merchant'
}

export const PEOPLE: Record<PersonId, Person> = {
  riya: { id: 'riya', name: 'Riya', upiId: 'riya@ptaxis', app: 'Paytm UPI', color: '#E85D9A', role: 'customer' },
  meena: { id: 'meena', name: 'Meena', upiId: 'meena@okaxis', app: 'Google Pay', color: '#2E9E6A', role: 'customer' },
  arjun: { id: 'arjun', name: 'Arjun', upiId: 'arjun@okhdfcbank', app: 'Google Pay', color: '#3B6FD8', role: 'customer' },
  kavya: { id: 'kavya', name: 'Kavya', upiId: 'kavya@oksbi', app: 'Google Pay', color: '#E8A21D', role: 'customer' },
  ramesh: { id: 'ramesh', name: 'Ramesh (shop owner)', upiId: 'ramesh@ptyes', app: 'Paytm UPI', color: '#F4F1EA', role: 'merchant' },
}

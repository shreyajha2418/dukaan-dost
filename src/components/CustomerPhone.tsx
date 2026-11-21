import type { World } from '../world/store'

const APP_COLORS: Record<string, string> = {
  PhonePe: '#5F259F',
  'Google Pay': '#1A73E8',
  'Paytm UPI': '#002E6E',
  'UPI app': '#37474F',
}

function fmtDate(d: string) {
  const dt = new Date(`${d}T12:00:00`)
  return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

/** Phone mock-up; the story drives every tap. */
export function CustomerPhone({ world }: { world: World }) {
  const { phone, date } = world
  const p = phone.person
  const appColor = p ? (APP_COLORS[p.app] ?? '#37474F') : '#37474F'

  return (
    <section className="panel phone-panel" aria-label="Customer phone">
      <div className="panel-label">Customer phone</div>
      <div className="phone">
        <div className="phone-notch" aria-hidden="true" />
        <div className="phone-status">
          <span>{fmtDate(date)}</span>
          <span aria-hidden="true">▂▄▆ 4G</span>
        </div>
        {phone.notification && (
          <div className="phone-notification" role="status">
            <strong>🎉 Cashback</strong>
            <span>{phone.notification}</span>
          </div>
        )}
        {!p ? (
          <div className="phone-idle">
            <div className="phone-clock">9:41</div>
            <p>Waiting for a customer…</p>
          </div>
        ) : (
          <div className="phone-app">
            <div className="app-bar" style={{ background: appColor }}>
              <span>{p?.app ?? 'UPI'}</span>
              <span className="app-bar-sub">Scan &amp; Pay</span>
            </div>
            <div className="app-body">
              <div className="payee">
                <div className="payee-avatar" aria-hidden="true">
                  RK
                </div>
                <div>
                  <div className="payee-name">Ramesh Kirana Store</div>
                  <div className="payee-sub">via shop QR sticker</div>
                </div>
              </div>
              <div className="amount" aria-label={`Amount ₹${phone.amount}`}>
                ₹{phone.amount}
              </div>
              {phone.note && <div className="amount-note">{phone.note}</div>}
              <div className="payer">
                From <strong>{p?.name}</strong> · <code>{p?.upiId}</code>
              </div>
              {phone.status === 'paid' ? (
                <div className="paid" role="status">
                  ✓ ₹{phone.amount} paid
                </div>
              ) : (
                <button
                  type="button"
                  className={`pay-btn${phone.status === 'paying' ? ' pressing' : ''}`}
                  disabled
                  aria-label={`Scan and pay ₹${phone.amount}`}
                >
                  {phone.status === 'paying' ? 'Paying…' : 'Scan & Pay'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

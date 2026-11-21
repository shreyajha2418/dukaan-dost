import type { World } from '../world/store'
import { BehindTheScenesLog } from './BehindTheScenesLog'

export function MerchantPanel({ world }: { world: World }) {
  const { merchant, shop } = world
  const cap = shop.config.monthlyCap
  const used = shop.rewardsPaid
  const pct = Math.min(100, (used / cap) * 100)
  const customers = Object.values(shop.customers)
  const returning = customers.filter((c) => c.visits >= 2).length

  return (
    <section className="panel merchant-panel" aria-label="Merchant and Paytm">
      <div className="panel-label">Merchant &amp; Paytm</div>
      <div className="biz">
        <div className="biz-bar">
          <span className="biz-title">Paytm for Business</span>
          <span className="biz-mock">mock screen</span>
        </div>
        <div className="biz-body">
          <label className="toggle-row">
            <span>
              <strong>Join Dukaan Dost</strong>
              <small>Soundbox speaks a reward line after payments</small>
            </span>
            <span className={`toggle${merchant.optedIn ? ' on' : ''}`} role="switch" aria-checked={merchant.optedIn}>
              <span className="knob" />
            </span>
          </label>

          <div className={`funding${merchant.optedIn ? '' : ' disabled'}`} role="radiogroup" aria-label="Reward funding">
            <div className={`fund-opt${merchant.funding === 'brand' ? ' selected' : ''}`} role="radio" aria-checked={merchant.funding === 'brand'}>
              <span className="radio" />
              <span>
                <strong>Brand-funded pool (Parle-G)</strong>
                <small>Free for the shop · ₹630/month cap</small>
              </span>
            </div>
            <div className={`fund-opt${merchant.funding === 'self' ? ' selected' : ''}`} role="radio" aria-checked={merchant.funding === 'self'}>
              <span className="radio" />
              <span>
                <strong>Self-fund</strong>
                <small>₹200 / ₹300 / ₹500 a month</small>
              </span>
            </div>
          </div>

          {merchant.showCap && (
            <div className="cap">
              <div className="cap-row">
                <span>Rewards this month</span>
                <strong>
                  ₹{used} / ₹{cap}
                </strong>
              </div>
              <div
                className={`cap-meter${pct >= 99 ? ' full' : ''}`}
                role="meter"
                aria-valuemin={0}
                aria-valuemax={cap}
                aria-valuenow={used}
                aria-label="Monthly reward cap used"
              >
                <span style={{ width: `${pct}%` }} />
              </div>
              <div className="stats">
                <div>
                  <strong>{customers.length}</strong>
                  <small>customers counted</small>
                </div>
                <div>
                  <strong>{returning}</strong>
                  <small>came back</small>
                </div>
                <div>
                  <strong>{shop.rewardsSent}</strong>
                  <small>rewards sent</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <BehindTheScenesLog log={world.log} />
    </section>
  )
}

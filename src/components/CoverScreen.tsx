import { Soundbox } from './Soundbox'

export function CoverScreen({ onStart, onFreePlay }: { onStart: () => void; onFreePlay: () => void }) {
  return (
    <div className="cover">
      <div className="cover-card">
        <div className="cover-art" aria-hidden="true">
          <Soundbox speaking />
        </div>
        <p className="cover-kicker">Concept prototype for a Paytm product case study. Not a Paytm product.</p>
        <h1>Dukaan Dost</h1>
        <p className="cover-pitch">The Paytm Soundbox that brings customers back.</p>
        <ul className="cover-points">
          <li>
            <strong>Problem:</strong> kirana shoppers now split small top-ups with quick-commerce apps, and nothing
            reminds them to pick the kirana next time.
          </li>
          <li>
            <strong>Idea:</strong> the shop's existing 4G Soundbox counts visits from any UPI ID and, on the 3rd visit in a
            month, announces a ₹10 cashback (₹15 on Paytm UPI).
          </li>
          <li>
            <strong>Who pays:</strong> an FMCG brand, as advertising: “Yeh cashback aapko Parle-G ki taraf se.” The
            merchant just opts in once.
          </li>
        </ul>
        <button type="button" className="big start" onClick={onStart}>
          ▶ Start the demo (sound on 🔊)
        </button>
        <p className="cover-meta">About 2½ minutes · auto-plays · captions on screen</p>
        <button type="button" className="link" onClick={onFreePlay}>
          Skip to free play
        </button>
      </div>
    </div>
  )
}

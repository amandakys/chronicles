import { toRomanNumerals } from '../utils/romanNumerals'
import './YearDivider.css'

function YearDivider({ year }) {
  return (
    <div className="year-divider">
      <div className="laurel-left">
        <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M55 40c-8 15-25 30-45 35 5-20 15-40 45-35z" fill="currentColor" opacity="0.8"/>
          <path d="M50 30c-6 12-20 25-40 30 4-18 14-35 40-30z" fill="currentColor" opacity="0.7"/>
          <path d="M45 22c-5 10-16 20-35 24 3-15 12-28 35-24z" fill="currentColor" opacity="0.6"/>
          <path d="M40 15c-4 8-13 16-30 19 3-12 10-22 30-19z" fill="currentColor" opacity="0.5"/>
          <path d="M35 10c-3 6-10 12-25 14 2-10 8-17 25-14z" fill="currentColor" opacity="0.4"/>
        </svg>
      </div>
      <h2 className="year-numeral">{toRomanNumerals(year)}</h2>
      <div className="laurel-right">
        <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 40c8 15 25 30 45 35-5-20-15-40-45-35z" fill="currentColor" opacity="0.8"/>
          <path d="M10 30c6 12 20 25 40 30-4-18-14-35-40-30z" fill="currentColor" opacity="0.7"/>
          <path d="M15 22c5 10 16 20 35 24-3-15-12-28-35-24z" fill="currentColor" opacity="0.6"/>
          <path d="M20 15c4 8 13 16 30 19-3-12-10-22-30-19z" fill="currentColor" opacity="0.5"/>
          <path d="M25 10c3 6 10 12 25 14-2-10-8-17-25-14z" fill="currentColor" opacity="0.4"/>
        </svg>
      </div>
    </div>
  )
}

export default YearDivider

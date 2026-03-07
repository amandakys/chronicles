import { toRomanNumerals } from '../utils/romanNumerals'
import './YearDivider.css'

function YearDivider({ year }) {
  return (
    <div className="year-divider">
      <div className="laurel-left" />
      <h2 className="year-numeral">{toRomanNumerals(year)}</h2>
      <div className="laurel-right" />
    </div>
  )
}

export default YearDivider

import aeLogo from '../assets/ae-logo.png'

export default function Logo({ className = '', size = 'default' }) {
  const heights = { small: 40, default: 72, large: 72, hero: 90 }
  const h = heights[size] || heights.default

  return (
    <img
      src={aeLogo}
      alt="Aharada Education"
      style={{
        height: `${h}px`,
        width: 'auto',
        maxWidth: '220px',
        objectFit: 'contain',
        objectPosition: 'left center',
        display: 'block',
      }}
      className={className}
    />
  )
}

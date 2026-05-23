import aeLogoIcon from '../assets/ae-logo-icon.png'

export default function Logo({ className = '', size = 'default' }) {
  const heights = { small: 36, default: 60, large: 60, hero: 80 }
  const h = heights[size] || heights.default

  return (
    <img
      src={aeLogoIcon}
      alt="Aharada Education"
      style={{
        height: `${h}px`,
        width: 'auto',
        objectFit: 'contain',
        objectPosition: 'left center',
        display: 'block',
      }}
      className={className}
    />
  )
}

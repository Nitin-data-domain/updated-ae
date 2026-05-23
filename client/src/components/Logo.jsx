import aeLogoIcon from '../assets/ae-logo-icon.png'

export default function Logo({ className = '', size = 'default' }) {
  const sizes = { small: 40, default: 52, large: 52, hero: 64 }
  const s = sizes[size] || sizes.default

  return (
    <div
      className={`logo-icon-wrap ${className}`}
      style={{
        width: `${s}px`,
        height: `${s}px`,
        borderRadius: '12px',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#1a3a5c',
      }}
    >
      <img
        src={aeLogoIcon}
        alt="Aharada Education"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          display: 'block',
        }}
      />
    </div>
  )
}


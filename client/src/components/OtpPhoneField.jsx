/**
 * OtpPhoneField — reusable phone + OTP verify widget.
 * Props:
 *   phone, onPhoneChange(val)
 *   otpVerified (bool)
 *   onVerified()   — called when verification succeeds
 *   error (string) — external validation error message
 */
import { useState, useEffect, useRef } from 'react'
import { FiPhone, FiCheckCircle, FiSend } from 'react-icons/fi'
import { sendOTP, verifyOTP } from '../api'
import toast from 'react-hot-toast'
import './OtpPhoneField.css'

const RESEND_SECONDS = 60

export default function OtpPhoneField({ phone, onPhoneChange, otpVerified, onVerified, error }) {
  const [otpSent, setOtpSent]         = useState(false)
  const [otp, setOtp]                 = useState('')
  const [sending, setSending]         = useState(false)
  const [verifying, setVerifying]     = useState(false)
  const [countdown, setCountdown]     = useState(0)
  const timerRef                      = useRef(null)

  useEffect(() => () => clearInterval(timerRef.current), [])

  function startCountdown() {
    setCountdown(RESEND_SECONDS)
    timerRef.current = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(timerRef.current); return 0 } return c - 1 })
    }, 1000)
  }

  const handleSend = async () => {
    const clean = phone.replace(/\D/g, '')
    if (clean.length < 10) { toast.error('Enter a valid 10-digit mobile number'); return }
    setSending(true)
    try {
      await sendOTP(phone)
      setOtpSent(true)
      setOtp('')
      startCountdown()
      toast.success('OTP sent to your mobile number!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setSending(false)
    }
  }

  const handleVerify = async () => {
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return }
    setVerifying(true)
    try {
      await verifyOTP(phone, otp)
      onVerified()
      toast.success('Phone number verified!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Incorrect OTP')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="otp-field-wrapper">
      {/* Phone row */}
      <div className={`otp-phone-row ${error ? 'has-error' : ''}`}>
        <span className="otp-cc">+91</span>
        <input
          type="tel"
          placeholder="Enter mobile number *"
          value={phone}
          maxLength={10}
          readOnly={otpVerified}
          onChange={e => {
            const val = e.target.value.replace(/\D/g, '').slice(0, 10)
            onPhoneChange(val)
            if (otpSent) { setOtpSent(false); setOtp('') }
          }}
          className={`otp-phone-input ${otpVerified ? 'verified' : ''}`}
          id="apply-phone"
        />
        {otpVerified ? (
          <span className="otp-verified-badge"><FiCheckCircle size={16} /> Verified</span>
        ) : (
          <button
            type="button"
            className="otp-send-btn"
            onClick={handleSend}
            disabled={sending || countdown > 0}
            id="send-otp-btn"
          >
            {sending ? 'Sending…' : countdown > 0 ? `${countdown}s` : otpSent ? 'Resend' : <><FiSend size={13}/> Send OTP</>}
          </button>
        )}
      </div>
      {error && <p className="otp-field-error">{error}</p>}

      {/* OTP input — visible after send */}
      {otpSent && !otpVerified && (
        <div className="otp-verify-row">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter 6-digit OTP"
            value={otp}
            maxLength={6}
            onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="otp-code-input"
            id="otp-code-input"
            autoFocus
          />
          <button
            type="button"
            className="otp-verify-btn"
            onClick={handleVerify}
            disabled={verifying || otp.length !== 6}
            id="verify-otp-btn"
          >
            {verifying ? 'Verifying…' : 'Verify OTP'}
          </button>
        </div>
      )}
      {otpSent && !otpVerified && (
        <p className="otp-hint">
          OTP sent to +91 {phone.slice(-10)}. Valid for 10 minutes.
          {countdown === 0 && <span className="otp-resend-link" onClick={handleSend}> Resend OTP</span>}
        </p>
      )}
    </div>
  )
}

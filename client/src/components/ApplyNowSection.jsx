import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiCheckCircle, FiShield, FiAward, FiUsers, FiBriefcase } from 'react-icons/fi'
import toast from 'react-hot-toast'
import { submitEnquiry, getPrograms } from '../api'
import './ApplyNowSection.css'

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh',
  'Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand',
  'Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur',
  'Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
  'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal',
]

const CITIES = {
  'Andhra Pradesh':    ['Guntur','Nellore','Tirupati','Vijayawada','Visakhapatnam'],
  'Arunachal Pradesh': ['Itanagar','Naharlagun'],
  'Assam':             ['Dibrugarh','Guwahati','Jorhat','Silchar'],
  'Bihar':             ['Bhagalpur','Gaya','Muzaffarpur','Patna'],
  'Chhattisgarh':      ['Bhilai','Bilaspur','Durg','Raipur'],
  'Delhi':             ['Central Delhi','East Delhi','New Delhi','North Delhi','South Delhi','West Delhi'],
  'Goa':               ['Margao','Panaji','Vasco da Gama'],
  'Gujarat':           ['Ahmedabad','Rajkot','Surat','Vadodara'],
  'Haryana':           ['Ambala','Faridabad','Gurugram','Hisar','Karnal','Panipat','Rohtak'],
  'Himachal Pradesh':  ['Dharamsala','Manali','Shimla','Solan'],
  'Jharkhand':         ['Bokaro','Dhanbad','Jamshedpur','Ranchi'],
  'Karnataka':         ['Bangalore','Belgaum','Hubli','Mangalore','Mysore'],
  'Kerala':            ['Kochi','Kozhikode','Thiruvananthapuram','Thrissur'],
  'Madhya Pradesh':    ['Bhopal','Gwalior','Indore','Jabalpur','Ujjain'],
  'Maharashtra':       ['Aurangabad','Mumbai','Nagpur','Nashik','Pune','Thane'],
  'Manipur':           ['Imphal','Thoubal'],
  'Meghalaya':         ['Shillong','Tura'],
  'Mizoram':           ['Aizawl','Lunglei'],
  'Nagaland':          ['Dimapur','Kohima'],
  'Odisha':            ['Bhubaneswar','Cuttack','Puri','Rourkela','Sambalpur'],
  'Punjab':            ['Amritsar','Chandigarh','Jalandhar','Ludhiana','Mohali','Patiala'],
  'Rajasthan':         ['Ajmer','Bikaner','Jaipur','Jodhpur','Kota','Udaipur'],
  'Sikkim':            ['Gangtok'],
  'Tamil Nadu':        ['Chennai','Coimbatore','Madurai','Salem','Trichy'],
  'Telangana':         ['Hyderabad','Karimnagar','Nizamabad','Warangal'],
  'Tripura':           ['Agartala','Udaipur'],
  'Uttar Pradesh':     ['Agra','Aligarh','Allahabad','Bareilly','Gorakhpur','Kanpur','Lucknow','Mathura','Meerut','Moradabad','Noida','Varanasi'],
  'Uttarakhand':       ['Dehradun','Haridwar','Haldwani','Nainital','Rishikesh'],
  'West Bengal':       ['Asansol','Durgapur','Howrah','Kolkata','Siliguri'],
}

const BENEFITS = [
  { icon: <FiShield size={20}/>, text: 'NAAC Accredited Programs' },
  { icon: <FiAward  size={20}/>, text: '100% Placement Guarantee' },
  { icon: <FiUsers  size={20}/>, text: '1000+ Alumni Placed' },
  { icon: <FiBriefcase size={20}/>, text: '25+ Industry Partners' },
]

const INIT = { name:'', email:'', phone:'', state:'', city:'', university:'', program:'', message:'', consent: false }

export default function ApplyNowSection({ heroMode = false }) {
  const [allPrograms, setAllPrograms] = useState([])
  const [form, setForm]               = useState(INIT)
  const [errors, setErrors]           = useState({})
  const [submitting, setSubmitting]   = useState(false)
  const [submitted, setSubmitted]     = useState(false)

  useEffect(() => {
    getPrograms().then(r => setAllPrograms(r.data.data)).catch(() => {})
  }, [])

  // Universities list (excluding Sage)
  const universities = useMemo(() => {
    const s = new Set()
    allPrograms.forEach(p => (p.universities || []).forEach(u => {
      if (u.name && u.name.toLowerCase() !== 'sage university') s.add(u.name)
    }))
    return [...s]
  }, [allPrograms])

  // Programs filtered by selected university (or all if none selected)
  const filteredPrograms = useMemo(() => {
    if (!form.university) return []
    return allPrograms.filter(p =>
      (p.universities || []).some(u => u.name === form.university)
    )
  }, [allPrograms, form.university])

  const cities = CITIES[form.state] || []

  const set = (field, val) => {
    setForm(prev => {
      const next = { ...prev, [field]: val }
      if (field === 'university') next.program = '' // reset program when university changes
      if (field === 'state') next.city = ''
      return next
    })
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name       = 'Name is required'
    if (!form.email.trim())   e.email      = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone || form.phone.replace(/\D/g,'').length < 10) e.phone = 'Enter valid 10-digit number'
    if (!form.state)          e.state      = 'Select your state'
    if (!form.city)           e.city       = 'Select your city'
    if (!form.university)     e.university = 'Select a university'
    if (!form.program)        e.program    = 'Select a program'
    if (!form.consent)        e.consent    = 'Please accept to continue'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validate()) { toast.error('Please fix the errors before submitting'); return }
    setSubmitting(true)
    try {
      await submitEnquiry({
        name: form.name, email: form.email,
        phone: `91${form.phone.replace(/\D/g,'')}`,
        program: form.program,
        university: form.university,
        message: `State: ${form.state}, City: ${form.city}. ${form.message}`.trim(),
        type: 'admission_lead',
      })
      setSubmitted(true)
      toast.success('Application submitted! We will contact you within 24 hours.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Shared form card JSX
  const formCard = (
    <div className={`apply-form-card${heroMode ? ' apply-form-card--hero' : ''}`}>
      {submitted ? (
        <div className="apply-success">
          <FiCheckCircle size={56} color="#2f855a"/>
          <h3>Application Received!</h3>
          <p>Thank you <strong>{form.name.split(' ')[0]}</strong>! Our counsellor will call you on <strong>+91 {form.phone}</strong> within 24 hours.</p>
          <button className="btn btn-primary" onClick={() => { setForm(INIT); setSubmitted(false) }}>
            Submit Another
          </button>
        </div>
      ) : (
        <form className="apply-form" onSubmit={handleSubmit} id={heroMode ? 'hero-apply-form' : 'home-apply-form'} noValidate>
          <h3 className="apply-form-title">Admission Enquiry</h3>

          <div className="aform-row">
            <div className="aform-group">
              <input id="apply-name" className={`aform-input ${errors.name?'err':''}`}
                type="text" placeholder="Full Name *" value={form.name}
                onChange={e => set('name', e.target.value)} />
              {errors.name && <span className="aform-err">{errors.name}</span>}
            </div>
            <div className="aform-group">
              <input id="apply-email" className={`aform-input ${errors.email?'err':''}`}
                type="email" placeholder="Email Address *" value={form.email}
                onChange={e => set('email', e.target.value)} />
              {errors.email && <span className="aform-err">{errors.email}</span>}
            </div>
          </div>

          {/* Phone */}
          <div className="aform-group">
            <div className={`otp-phone-row ${errors.phone ? 'has-error' : ''}`}>
              <span className="otp-cc">+91</span>
              <input
                id="apply-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="Mobile Number *"
                value={form.phone}
                onChange={e => set('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="otp-phone-input aform-input"
              />
            </div>
            {errors.phone && <span className="aform-err">{errors.phone}</span>}
          </div>

          <div className="aform-row">
            <div className="aform-group">
              <select id="apply-state" className={`aform-select ${errors.state?'err':''}`}
                value={form.state} onChange={e => set('state', e.target.value)}>
                <option value="">Select State *</option>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <span className="aform-err">{errors.state}</span>}
            </div>
            <div className="aform-group">
              <select id="apply-city" className={`aform-select ${errors.city?'err':''}`}
                value={form.city} onChange={e => set('city', e.target.value)} disabled={!form.state}>
                <option value="">{form.state ? 'Select City *' : 'Select State first'}</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.city && <span className="aform-err">{errors.city}</span>}
            </div>
          </div>

          <div className="aform-row">
            <div className="aform-group">
              <select id="apply-university" className={`aform-select ${errors.university?'err':''}`}
                value={form.university} onChange={e => set('university', e.target.value)}>
                <option value="">Select University *</option>
                {universities.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
              {errors.university && <span className="aform-err">{errors.university}</span>}
            </div>
            <div className="aform-group">
              <select id="apply-program" className={`aform-select ${errors.program?'err':''}`}
                value={form.program} onChange={e => set('program', e.target.value)}
                disabled={!form.university}>
                <option value="">{form.university ? 'Select Program *' : 'Select University first'}</option>
                {filteredPrograms.map(p => <option key={p._id} value={p.title}>{p.title}</option>)}
              </select>
              {errors.program && <span className="aform-err">{errors.program}</span>}
            </div>
          </div>

          {/* Consent */}
          <label className={`aform-consent ${errors.consent?'err':''}`}>
            <input type="checkbox" checked={form.consent} onChange={e => set('consent', e.target.checked)}/>
            <span>I authorise Aharada Education and its representatives to Call, SMS, Email or WhatsApp me regarding admission enquiries.</span>
          </label>
          {errors.consent && <span className="aform-err">{errors.consent}</span>}

          <button
            type="submit" id={heroMode ? 'hero-apply-submit-btn' : 'home-apply-submit-btn'}
            className="aform-submit-btn"
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : <><FiSend size={16}/> Submit Application</>}
          </button>
        </form>
      )}
    </div>
  )

  // Hero mode — just the card, no section wrapper
  if (heroMode) return formCard

  return (
    <section className="apply-section" id="apply-now-section">
      <div className="apply-inner container">

        {/* Left panel */}
        <motion.div
          className="apply-left"
          initial={{ opacity:0, x:-40 }} whileInView={{ opacity:1, x:0 }}
          viewport={{ once:true }} transition={{ duration:.7 }}
        >
          <span className="apply-left-badge">Admissions Open 2026–27</span>
          <h2 className="apply-left-title">Start Your Journey<br/>to Success Today</h2>
          <p className="apply-left-sub">
            Fill the form and our expert counsellor will call you within <strong>24 hours</strong> — absolutely free.
          </p>
          <ul className="apply-benefits">
            {BENEFITS.map((b, i) => (
              <li key={i} className="apply-benefit-item">
                <span className="apply-benefit-icon">{b.icon}</span>
                {b.text}
              </li>
            ))}
          </ul>
          <div className="apply-contact-note">
            <FiCheckCircle size={16}/> No admission fee for enquiry
          </div>
        </motion.div>

        {/* Right: Form card */}
        <motion.div
          initial={{ opacity:0, x:40 }} whileInView={{ opacity:1, x:0 }}
          viewport={{ once:true }} transition={{ duration:.7, delay:.1 }}
        >
          {formCard}
        </motion.div>
      </div>
    </section>
  )
}


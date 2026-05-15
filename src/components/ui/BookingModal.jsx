import { useState, useEffect } from 'react'
import { services } from '../../data/siteData'
import './BookingModal.css'

const DOCTORS = ['Dr. Onoja G.']
const DAYS    = Array.from({ length: 31 }, (_, i) => i + 1)
const MONTHS  = ['January','February','March','April','May','June','July','August','September','October','November','December']
const YEARS   = [2025, 2026, 2027]
const HOURS   = ['8:00','8:30','9:00','9:30','10:00','10:30','11:00','11:30','12:00','1:00','2:00','2:30','3:00','3:30','4:00','4:30']
const PERIODS = ['AM', 'PM']

export default function BookingModal({ onClose }) {
  const [form, setForm] = useState({
    service: '', doctor: '', name: '', phone: '',
    day: '', month: '', year: '', hour: '', period: 'AM',
  })
  const [submitted, setSubmitted] = useState(false)

  // lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="bm-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bm-modal" role="dialog" aria-modal="true" aria-label="Book an appointment">

        {/* Left photo panel */}
        <div className="bm-photo">
          <img
            src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80"
            alt="Optometrist at Corporate Eye Clinic"
          />
          <div className="bm-photo__overlay">
            <p className="bm-photo__quote">"Protecting your vision is our highest priority."</p>
            <p className="bm-photo__attr">— Corporate Eye Clinic</p>
          </div>
        </div>

        {/* Right form panel */}
        <div className="bm-form-wrap">
          <button className="bm-close" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {submitted ? (
            <div className="bm-success">
              <div className="bm-success__icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3>Booking received!</h3>
              <p>Thank you, <strong>{form.name}</strong>. We'll confirm your appointment within 24 hours.</p>
              <button className="btn btn--primary" onClick={onClose}>Done</button>
            </div>
          ) : (
            <>
              <span className="bm-eyebrow">Take the next step</span>
              <h2 className="bm-title">Schedule an Appointment</h2>

              <form className="bm-form" onSubmit={submit} noValidate>
                <div className="bm-row">
                  <div className="bm-field">
                    <label>SERVICE</label>
                    <div className="bm-select-wrap">
                      <select value={form.service} onChange={set('service')}>
                        <option value="">Select Service</option>
                        {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
                        <option value="general">General eye exam</option>
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                  <div className="bm-field">
                    <label>DOCTOR</label>
                    <div className="bm-select-wrap">
                      <select value={form.doctor} onChange={set('doctor')}>
                        <option value="">Select Doctor</option>
                        {DOCTORS.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                </div>

                <div className="bm-row">
                  <div className="bm-field">
                    <label>YOUR NAME *</label>
                    <input type="text" placeholder="Your Name" value={form.name} onChange={set('name')} required />
                  </div>
                  <div className="bm-field">
                    <label>YOUR PHONE</label>
                    <input type="tel" placeholder="Your Phone" value={form.phone} onChange={set('phone')} />
                  </div>
                </div>

                <div className="bm-date-row">
                  <div className="bm-field bm-field--sm">
                    <label>DAY</label>
                    <div className="bm-select-wrap">
                      <select value={form.day} onChange={set('day')}>
                        <option value="">Day</option>
                        {DAYS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                  <div className="bm-field bm-field--md">
                    <label>MONTH</label>
                    <div className="bm-select-wrap">
                      <select value={form.month} onChange={set('month')}>
                        <option value="">Month</option>
                        {MONTHS.map((m) => <option key={m}>{m}</option>)}
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                  <div className="bm-field bm-field--sm">
                    <label>YEAR</label>
                    <div className="bm-select-wrap">
                      <select value={form.year} onChange={set('year')}>
                        {YEARS.map((y) => <option key={y}>{y}</option>)}
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                  <div className="bm-field bm-field--sm">
                    <label>TIME</label>
                    <div className="bm-select-wrap">
                      <select value={form.hour} onChange={set('hour')}>
                        <option value="">Hour</option>
                        {HOURS.map((h) => <option key={h}>{h}</option>)}
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                  <div className="bm-field bm-field--xs">
                    <label>&nbsp;</label>
                    <div className="bm-select-wrap">
                      <select value={form.period} onChange={set('period')}>
                        {PERIODS.map((p) => <option key={p}>{p}</option>)}
                      </select>
                      <ChevronIcon />
                    </div>
                  </div>
                </div>

                <button type="submit" className="bm-submit">
                  BOOK AN APPOINTMENT
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

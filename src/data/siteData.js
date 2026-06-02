// ─── Navigation ────────────────────────────────────────────────────────────────
export const navLinks = [
  { label: 'Home', path: '/' },
  {
    label: 'Services',
    path: '/services',
    children: [
      { label: 'Comprehensive Eye Examination', path: '/services#eye-exam' },
      { label: 'Glaucoma Management',           path: '/services#glaucoma' },
      { label: 'Contact Lens Practice',         path: '/services#contacts' },
      { label: 'Low Vision Rehabilitation',     path: '/services#low-vision' },
      { label: 'Pediatric Eye Care',            path: '/services#pediatric' },
      { label: 'Industrial & Pre-Employment',   path: '/services#industrial' },
    ],
  },
  { label: 'About',   path: '/about' },
  { label: 'Shop',    path: '/shop' },
  { label: 'Contact', path: '/contact' },
]

// ─── Services ──────────────────────────────────────────────────────────────────
export const services = [
  {
    id: 'eye-exam',
    icon: 'eye-check',
    title: 'Comprehensive Eye Examination',
    short: 'Computerised, thorough eye exams for individuals, families, schools, and organisations.',
    description: 'Our comprehensive eye examination uses state-of-the-art computerised equipment to evaluate your vision and overall eye health. We assess visual acuity, eye pressure, colour vision, and screen for early signs of disease.',
    symptoms: ['Blurred or hazy vision', 'Frequent headaches', 'Eye strain or fatigue', 'Difficulty reading', 'Squinting', 'Sensitivity to light'],
  },
  {
    id: 'glaucoma',
    icon: 'shield-check',
    title: 'Glaucoma Management',
    short: 'Early detection and ongoing management to protect your long-term vision.',
    description: 'Glaucoma is a leading cause of irreversible blindness, but early detection can stop the damage. We use state-of-the-art imaging and pressure testing to monitor and manage glaucoma effectively.',
    symptoms: ['Often asymptomatic early on', 'Gradual loss of peripheral vision', 'Halos around lights', 'Eye pain or pressure', 'Blurred vision', 'Nausea with eye pain'],
  },
  {
    id: 'contacts',
    icon: 'droplet',
    title: 'Contact Lens Practice',
    short: 'Expert fittings for all contact lens types — daily, monthly, and specialty lenses.',
    description: 'Our optometrists provide professional contact lens assessments and fittings for all lens types. Whether you need soft daily disposables, toric lenses for astigmatism, or multifocal lenses, we will find the right fit.',
    symptoms: ['Discomfort wearing current lenses', 'Desire to stop wearing glasses', 'Dry or irritated eyes with lenses', 'Blurred vision with contact lenses', 'Difficulty inserting or removing lenses', 'Frequent lens replacements needed'],
  },
  {
    id: 'low-vision',
    icon: 'urgent',
    title: 'Low Vision Rehabilitation',
    short: 'Specialised support and aids for patients with significant vision loss.',
    description: 'Low vision rehabilitation helps patients with significant vision impairment that cannot be fully corrected. Our team provides specialised aids, adaptive strategies, and ongoing support to help patients maximise independence.',
    symptoms: ['Difficulty reading even with glasses', 'Inability to recognise faces', 'Problems with daily activities', 'Significant central or peripheral vision loss', 'Difficulty with contrast and glare', 'Vision loss from disease or injury'],
  },
  {
    id: 'pediatric',
    icon: 'baby',
    title: 'Pediatric Eye Care',
    short: 'Vision exams and care tailored for children at every stage of development.',
    description: "Your child's visual system develops rapidly in the early years of life. We offer comprehensive eye exams designed to detect and treat conditions early — from refractive errors and lazy eye to squints and colour vision deficiencies.",
    symptoms: ['Squinting or closing one eye', 'Sitting too close to screens', 'Frequent eye rubbing', 'Headaches after reading', 'Difficulty reading or at school', 'One eye turning in or out'],
  },
  {
    id: 'industrial',
    icon: 'home-heart',
    title: 'Industrial & Pre-Employment Screening',
    short: 'Vision assessments for workplace safety, corporate health, and pre-employment checks.',
    description: 'We provide comprehensive vision screening services for businesses, schools, and organisations across Ibadan. Our screenings assess visual acuity, colour vision, depth perception, and other parameters relevant to workplace safety.',
    symptoms: ['Required for employment clearance', 'Workplace safety compliance', 'School vision screening programmes', 'Corporate health and wellness checks', 'Driver and operator vision standards', 'Periodic occupational health reviews'],
  },
]

// ─── Stats ─────────────────────────────────────────────────────────────────────
export const stats = [
  { value: '2001',  label: 'Year established' },
  { value: '3',     label: 'Clinic locations' },
  { value: '20+',   label: 'Years of trusted care' },
  { value: '5★',   label: 'Patient rated' },
]

// ─── Testimonials ──────────────────────────────────────────────────────────────
export const testimonials = [
  { id: 1, name: 'Funke A.',  initials: 'FA', rating: 5, text: 'Excellent service! Dr. Onoja was thorough and explained everything clearly. My new glasses prescription is perfect. I can now see clearly for the first time in years.' },
  { id: 2, name: 'Seun O.',   initials: 'SO', rating: 5, text: 'I brought my children for eye screening and the team was so patient and kind. They found that my daughter needed glasses and handled it all professionally.' },
  { id: 3, name: 'Tunde B.',  initials: 'TB', rating: 5, text: 'Best eye clinic in Ibadan. The equipment is modern, the environment is clean, and the doctor takes time with each patient. Highly recommended.' },
  { id: 4, name: 'Amaka N.',  initials: 'AN', rating: 5, text: 'I was diagnosed with early glaucoma and Dr. Onoja has been managing it expertly. Regular monitoring has kept my condition stable. Very grateful.' },
  { id: 5, name: 'Biodun K.', initials: 'BK', rating: 5, text: 'Fast, professional, and affordable. The contact lens fitting was seamless and my lenses fit perfectly. Will definitely be coming back.' },
]

// ─── FAQs ──────────────────────────────────────────────────────────────────────
export const faqs = [
  { q: 'How often should I have an eye exam?', a: 'Adults with no known eye conditions should have a comprehensive eye exam every 1-2 years. Children should be examined annually, and anyone with conditions like glaucoma or diabetes should follow their optometrist\'s schedule.' },
  { q: 'What are the early signs of glaucoma?', a: 'Glaucoma is often called the "silent thief of sight" because it has no symptoms early on. The only reliable way to detect it is through a comprehensive eye exam including eye pressure testing and optic nerve assessment.' },
  { q: 'Do you offer school and corporate screening?', a: 'Yes. We offer vision screening programmes for schools, businesses, and organisations across Ibadan. Contact us to discuss a tailored programme for your group or company.' },
  { q: 'What age should children have their first eye exam?', a: 'Children should have their first eye exam before starting school, ideally around age 3-4. Early detection of conditions like lazy eye or squint is critical for effective treatment.' },
  { q: 'Can I get contact lenses if I have astigmatism?', a: 'Yes. We offer toric contact lenses specifically designed for astigmatism. Our optometrists will assess your eyes and recommend the most suitable lens type for your prescription and lifestyle.' },
  { q: 'Do you accept walk-ins or is appointment required?', a: 'We welcome both walk-ins and appointments. However, booking ensures you are seen promptly with adequate time allocated. Call or WhatsApp us to book.' },
]

// ─── Conditions Treated ────────────────────────────────────────────────────────
export const conditions = [
  'Myopia (short-sightedness)',
  'Hyperopia (long-sightedness)',
  'Astigmatism',
  'Glaucoma',
  'Cataracts',
  'Dry eye syndrome',
  'Diabetic retinopathy',
  'Macular degeneration',
]

// ─── Team ──────────────────────────────────────────────────────────────────────
export const team = [
  {
    name: 'Dr. Onoja G.',
    initials: 'OG',
    role: 'Chief Optometrist & Chief Medical Director',
    photo: 'https://res.cloudinary.com/dgde8cwjk/image/upload/v1779926600/WhatsApp_Image_2026-05-19_at_12.12.05_PM_sb7cvq.jpg',
    bio: 'Corporate Eye Clinic is a trusted eye care center in Ibadan, Oyo State, offering expert services in optometry, vision correction, and eye disease management. Dr. Onoja leads a team of certified optometrists providing thorough eye exams, accurate lens prescriptions, and treatment for glaucoma, cataracts, and dry eye syndrome.',
    specialties: ['Glaucoma Management', 'Refraction', 'Pediatric Eye Care', 'Contact Lens Practice'],
  },
]

// ─── Shop Categories ───────────────────────────────────────────────────────────
export const shopCategories = [
  { id: 'all',        label: 'All' },
  { id: 'frames',     label: 'Frames' },
  { id: 'contacts',   label: 'Contact Lenses' },
  { id: 'sunglasses', label: 'Sunglasses' },
  { id: 'for-him',    label: 'For Him' },
  { id: 'for-her',    label: 'For Her' },
  { id: 'for-kids',   label: 'For Kids' },
]

// ─── Contact & Hours ───────────────────────────────────────────────────────────
export const contactInfo = {
  address:  '33 Osuntokun Avenue, Old Bodija, Ibadan',
  phone:    '+234 803 337 2738',
  email:    'corporateeyeclinic@gmail.com',
  whatsapp: 'https://wa.me/2348033372738',
  socials: {
    facebook:  'https://facebook.com/corporateeyeclinic',
    instagram: 'https://instagram.com/corporateeyeclinic',
    linkedin:  'https://linkedin.com/company/corporateeyeclinic',
  },
}

export const hours = [
  { day: 'Monday',    open: '8:00 AM', close: '6:00 PM' },
  { day: 'Tuesday',   open: '8:00 AM', close: '6:00 PM' },
  { day: 'Wednesday', open: '8:00 AM', close: '6:00 PM' },
  { day: 'Thursday',  open: '8:00 AM', close: '6:00 PM' },
  { day: 'Friday',    open: '8:00 AM', close: '6:00 PM' },
  { day: 'Saturday',  open: '9:00 AM', close: '4:00 PM' },
  { day: 'Sunday',    open: null,      close: null },
]

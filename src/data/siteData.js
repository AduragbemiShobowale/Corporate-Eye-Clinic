export const navLinks = [
  { label: 'Home', path: '/' },
  {
    label: 'Services', path: '/services',
    children: [
      { label: 'Comprehensive Eye Exam',      path: '/services#eye-exam' },
      { label: 'Glaucoma Management',         path: '/services#glaucoma' },
      { label: 'Contact Lens Practice',       path: '/services#contacts' },
      { label: 'Low Vision Rehabilitation',   path: '/services#low-vision' },
      { label: 'Pediatric Eye Care',          path: '/services#pediatric' },
      { label: 'Industrial Vision Screening', path: '/services#industrial' },
    ],
  },
  { label: 'About',   path: '/about' },
  { label: 'Shop',    path: '/shop' },
  { label: 'Contact', path: '/contact' },
]

export const services = [
  {
    id: 'eye-exam',
    icon: 'eye-check',
    title: 'Comprehensive Eye Examination',
    short: 'Thorough computerised eye exams to screen for all ocular conditions and vision problems.',
    description:
      'With our computerised technology, every patient is thoroughly screened for all ocular pathology. Any findings are identified and treated appropriately at our clinic. We assess your full visual health — not just your prescription.',
    symptoms: [
      'Blurred or double vision',
      'Eye strain or headaches',
      'Difficulty reading',
      'Sensitivity to light',
      'Sudden vision changes',
      'Routine annual check-up',
    ],
  },
  {
    id: 'glaucoma',
    icon: 'shield-check',
    title: 'Glaucoma Management',
    short: 'Early detection and ongoing management to preserve your sight for life.',
    description:
      'Glaucoma is a leading cause of irreversible blindness, but early detection makes all the difference. We use advanced diagnostic tools to detect elevated intraocular pressure and optic nerve damage before symptoms appear, and manage the condition over the long term.',
    symptoms: [
      'Often symptomless in early stages',
      'Gradual loss of peripheral vision',
      'Halos around lights',
      'Eye pain or redness',
      'Blurred vision',
      'Family history of glaucoma',
    ],
  },
  {
    id: 'contacts',
    icon: 'droplet',
    title: 'Contact Lens Practice',
    short: 'From daily disposables to custom-made lenses — fitted precisely for your eyes.',
    description:
      'We fit a wide variety of contact lenses, from the most popular daily disposable lenses to custom-made options for complex prescriptions. Our specialists ensure every lens fits comfortably and provides optimal vision correction for your lifestyle.',
    symptoms: [
      'Wanting an alternative to glasses',
      'Discomfort with current lenses',
      'High prescription needs',
      'Dry eyes with lenses',
      'Interest in coloured contacts',
      'Sports and active lifestyle needs',
    ],
  },
  {
    id: 'low-vision',
    icon: 'urgent',
    title: 'Low Vision Rehabilitation',
    short: 'Specialist support and aids to help patients with significant vision loss live independently.',
    description:
      'Low vision rehabilitation helps patients who cannot be fully corrected by glasses, contact lenses, or surgery make the most of their remaining sight. We assess your functional vision and recommend the right combination of optical and non-optical aids.',
    symptoms: [
      'Significant vision loss not correctable by glasses',
      'Difficulty with daily tasks',
      'Macular degeneration',
      'Diabetic retinopathy',
      'Retinitis pigmentosa',
      'Post-surgical vision changes',
    ],
  },
  {
    id: 'pediatric',
    icon: 'baby',
    title: 'Pediatric Eye Care',
    short: 'School vision screenings and full eye care for children of all ages.',
    description:
      'Our school eye health programmes provide a unique opportunity to deliver comprehensive eye health services to school-going children. Early detection of vision problems ensures children can learn without visual barriers holding them back.',
    symptoms: [
      'Squinting or closing one eye',
      'Sitting too close to the board',
      'Frequent eye rubbing',
      'Difficulty reading or writing',
      'Headaches after school',
      'One eye turning inward or outward',
    ],
  },
  {
    id: 'industrial',
    icon: 'home-heart',
    title: 'Industrial & Pre-Employment Screening',
    short: 'Vision screening for organisations, pre-employment assessments, and workplace eye safety.',
    description:
      'We provide occupational vision screening services for organisations, including pre-employment visual assessments, industrial vision screenings, and ongoing workplace eye health programmes. Our reports meet standard corporate and regulatory requirements.',
    symptoms: [
      'Pre-employment requirements',
      'Industrial safety compliance',
      'Colour vision assessment',
      'Depth perception testing',
      'Driving vision standards',
      'Annual corporate screening programmes',
    ],
  },
]

export const stats = [
  { value: '2001',  label: 'Established' },
  { value: '3',     label: 'Locations in Ibadan' },
  { value: '20+',   label: 'Years of trusted care' },
  { value: '5★',   label: 'Patient-rated service' },
]

export const testimonials = [
  {
    id: 1, name: 'Adebayo T.', initials: 'AT', rating: 5,
    text: 'Highly sophisticated and the technology is top notch. If you live in the south-west, think no other — think Corporate Eye Clinic. Definitely a place to visit.',
  },
  {
    id: 2, name: 'Funke O.', initials: 'FO', rating: 5,
    text: 'A very neat and friendly environment with high treatment standards. Very accommodating staff with the right customer approach.',
  },
  {
    id: 3, name: 'Chidi M.', initials: 'CM', rating: 5,
    text: 'I ordered my contact lenses and they were delivered to Ogbomosho in no time. Fast, effective, professional, and cost-friendly. I recommend 100%.',
  },
  {
    id: 4, name: 'Sola A.', initials: 'SA', rating: 5,
    text: 'Their counselling and explanation reassured me I was getting the best treatment. Thank you so much for saving my vision!',
  },
  {
    id: 5, name: 'Ngozi K.', initials: 'NK', rating: 5,
    text: 'The customer service is commendable. The environment is cool, calm, well planned and well decorated. A place I will always return to.',
  },
]

export const faqs = [
  {
    q: 'What happens during a comprehensive eye examination?',
    a: 'Our computerised eye exam covers your full visual health — prescription, eye pressure, retinal health, and screening for conditions like glaucoma, cataracts, and diabetic eye disease. It typically takes 30–45 minutes.',
  },
  {
    q: 'Do you offer contact lenses for high prescriptions?',
    a: 'Yes. We fit a wide range of contact lenses including custom-made options for complex or high prescriptions. Our specialists will assess your eyes and recommend the best type for your needs and lifestyle.',
  },
  {
    q: 'Can children wear contact lenses?',
    a: 'Yes, depending on their age, maturity, and prescription. We assess each child individually and provide guidance on the most suitable lens type and care routine.',
  },
  {
    q: 'How often should I have my eyes examined?',
    a: 'We recommend a comprehensive eye exam at least once every year, or more frequently if you have a known eye condition, diabetes, or a family history of glaucoma.',
  },
  {
    q: 'Do you offer corporate or group screenings?',
    a: "Yes. We provide pre-employment vision assessments, industrial vision screenings, and ongoing corporate eye health programmes for organisations. Contact us to discuss your organisation's needs.",
  },
  {
    q: 'Where are your locations in Ibadan?',
    a: 'Our main branch is at 33 Osuntokun Avenue, Old Bodija. We also have locations at Cocoa House Heritage Mall and LA Goshen, Oluyole Estate, Ibadan.',
  },
]

export const conditions = [
  'Comprehensive computerised eye examination',
  'Glaucoma detection and management',
  'Contact lens fitting (daily, monthly & custom)',
  'Low vision rehabilitation',
  'Pre-school and school vision screening',
  'Pre-employment & industrial vision screening',
  'Diabetic eye assessment',
  'Cataract evaluation and referral',
]

export const team = [
  {
    name: 'Dr. Onoja G.',
    role: 'Lead Optometrist & Clinic Director',
    initials: 'OG',
    bio: 'Dr. Onoja founded Corporate Eye Clinic in 2001 with a mission to provide affordable, high-quality eye care to the people of Ibadan and surrounding communities. With over two decades of clinical experience, he leads a team committed to the highest standards of optometric care.',
    specialties: ['Medical Optometry', 'Glaucoma Management', 'Low Vision Rehabilitation'],
  },
]

export const shopCategories = [
  { id: 'all',        label: 'All' },
  { id: 'frames',     label: 'Frames' },
  { id: 'contacts',   label: 'Contact Lenses' },
  { id: 'sunglasses', label: 'Sunglasses' },
  { id: 'for-him',    label: 'For Him' },
  { id: 'for-her',    label: 'For Her' },
  { id: 'for-kids',   label: 'For Kids' },
]

export const contactInfo = {
  address:  '33 Osuntokun Avenue, Old Bodija, Ibadan, Oyo State',
  address2: 'Cocoa House Heritage Mall, Ibadan',
  address3: 'LA Goshen, Opp. Bovas Station, Oluyole Estate, Ibadan',
  phone:    '+234 803 337 2738',
  phone2:   '+234 808 364 5725',
  email:    'info@corporateeyeclinic.com',
  whatsapp: 'https://wa.me/2348033372738',
  socials: {
    facebook:  'https://www.facebook.com/corporateeyeclinic',
    instagram: 'https://www.instagram.com/corporateeyeclinic',
    linkedin:  'https://www.linkedin.com/company/corporate-eye-clinic',
  },
}

export const hours = [
  { day: 'Monday',    open: '8:00 AM', close: '5:00 PM' },
  { day: 'Tuesday',   open: '8:00 AM', close: '5:00 PM' },
  { day: 'Wednesday', open: '8:00 AM', close: '5:00 PM' },
  { day: 'Thursday',  open: '8:00 AM', close: '5:00 PM' },
  { day: 'Friday',    open: '8:00 AM', close: '5:00 PM' },
  { day: 'Saturday',  open: '8:00 AM', close: '2:00 PM' },
  { day: 'Sunday',    open: null,      close: null },
]

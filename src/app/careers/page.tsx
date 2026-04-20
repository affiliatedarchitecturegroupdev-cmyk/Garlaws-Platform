'use client';

interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  experience: 'entry' | 'mid' | 'senior' | 'lead';
  salary: string;
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
}

export default function CareersPage() {
  const jobPostings: JobPosting[] = [
    {
      id: 'senior-fullstack-dev',
      title: 'Senior Full-Stack Developer',
      department: 'Engineering',
      location: 'Cape Town, South Africa (Remote options)',
      type: 'full-time',
      experience: 'senior',
      salary: 'R45,000 - R65,000/month',
      description: 'We are looking for a Senior Full-Stack Developer to join our growing engineering team. You will be responsible for designing, developing, and maintaining scalable web applications using modern technologies.',
      requirements: [
        '5+ years of experience in full-stack development',
        'Strong proficiency in React, Node.js, and TypeScript',
        'Experience with cloud platforms (AWS, Azure, or GCP)',
        'Knowledge of database design and optimization',
        'Experience with agile development methodologies',
        'Bachelor\'s degree in Computer Science or related field'
      ],
      benefits: [
        'Competitive salary and equity package',
        'Flexible working hours and remote work options',
        'Professional development budget',
        'Health and wellness benefits',
        'Modern office with great amenities',
        'Opportunity to work on cutting-edge technology'
      ],
      postedDate: '2024-01-15'
    },
    {
      id: 'product-manager',
      title: 'Product Manager',
      department: 'Product',
      location: 'Johannesburg, South Africa',
      type: 'full-time',
      experience: 'mid',
      salary: 'R40,000 - R55,000/month',
      description: 'Join our product team to drive the development of innovative enterprise software solutions. You will work closely with engineering, design, and business teams to define product strategy and roadmap.',
      requirements: [
        '3+ years of product management experience',
        'Experience with SaaS products and enterprise software',
        'Strong analytical and problem-solving skills',
        'Excellent communication and leadership abilities',
        'Experience with product analytics and metrics',
        'Background in technology or business preferred'
      ],
      benefits: [
        'Competitive compensation package',
        'Health insurance and wellness programs',
        'Flexible work arrangements',
        'Professional development opportunities',
        'Collaborative and innovative work environment',
        'Impact on products used by thousands of businesses'
      ],
      postedDate: '2024-01-10'
    },
    {
      id: 'ux-designer',
      title: 'UX/UI Designer',
      department: 'Design',
      location: 'Cape Town, South Africa (Hybrid)',
      type: 'full-time',
      experience: 'mid',
      salary: 'R35,000 - R50,000/month',
      description: 'We are seeking a talented UX/UI Designer to create exceptional user experiences for our enterprise platform. You will work on designing intuitive interfaces that solve complex business problems.',
      requirements: [
        '3+ years of UX/UI design experience',
        'Proficiency in Figma, Sketch, or Adobe Creative Suite',
        'Strong portfolio demonstrating design thinking',
        'Experience with user research and usability testing',
        'Knowledge of design systems and component libraries',
        'Understanding of enterprise software design principles'
      ],
      benefits: [
        'Creative and collaborative work environment',
        'Modern design tools and resources',
        'Flexible hybrid work model',
        'Health and wellness benefits',
        'Professional development and conference attendance',
        'Opportunity to shape enterprise software design'
      ],
      postedDate: '2024-01-08'
    },
    {
      id: 'devops-engineer',
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote (Africa)',
      type: 'full-time',
      experience: 'mid',
      salary: 'R50,000 - R70,000/month',
      description: 'Build and maintain our cloud infrastructure and CI/CD pipelines. You will work with modern DevOps tools and practices to ensure reliable, scalable, and secure deployments.',
      requirements: [
        '3+ years of DevOps or SRE experience',
        'Strong experience with AWS, Docker, and Kubernetes',
        'Proficiency in Infrastructure as Code (Terraform, CloudFormation)',
        'Experience with CI/CD pipelines (GitHub Actions, Jenkins)',
        'Knowledge of monitoring and logging tools',
        'Scripting skills (Python, Bash, etc.)'
      ],
      benefits: [
        'Fully remote work arrangement',
        'Competitive salary with performance bonuses',
        'Latest tools and cloud resources',
        'Flexible working hours',
        'Learning and certification budget',
        'Global team collaboration'
      ],
      postedDate: '2024-01-12'
    }
  ];

  const companyValues = [
    {
      icon: '🚀',
      title: 'Innovation First',
      description: 'We push boundaries and embrace cutting-edge technology to solve complex problems.'
    },
    {
      icon: '🤝',
      title: 'Collaboration',
      description: 'We believe in the power of teamwork and diverse perspectives to achieve excellence.'
    },
    {
      icon: '📈',
      title: 'Growth Mindset',
      description: 'Continuous learning and personal development are core to our culture.'
    },
    {
      icon: '🌍',
      title: 'Global Impact',
      description: 'We build solutions that make a positive difference in businesses worldwide.'
    },
    {
      icon: '⚖️',
      title: 'Integrity',
      description: 'We conduct business with honesty, transparency, and ethical standards.'
    },
    {
      icon: '🎯',
      title: 'Customer Focus',
      description: 'Our customers\' success is our ultimate measure of achievement.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Our Team</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Help us build the future of enterprise software. We're looking for talented individuals
            who are passionate about technology and making a difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#openings" className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg">
              View Open Positions
            </a>
            <a href="#culture" className="border-2 border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:border-blue-500 hover:text-blue-600 transition-all">
              Our Culture
            </a>
          </div>
        </div>

        {/* Company Values */}
        <section id="culture" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Culture & Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {companyValues.map((value, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{value.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why Join Us */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-8 text-white mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Why Join Garlaws?</h2>
            <p className="text-xl text-blue-100">Be part of something extraordinary</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-3">Innovative Technology</h3>
              <p className="text-blue-100">Work with cutting-edge technologies and modern development practices</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-semibold mb-3">Global Impact</h3>
              <p className="text-blue-100">Your work will help businesses across Africa and beyond succeed</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-3">Growth Opportunities</h3>
              <p className="text-blue-100">Continuous learning, mentorship, and career development programs</p>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section id="openings">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Open Positions</h2>

          <div className="space-y-6">
            {jobPostings.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {job.department}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      <span>📍 {job.location}</span>
                      <span>💼 {job.type.replace('-', ' ')}</span>
                      <span>📊 {job.experience} level</span>
                      <span>💰 {job.salary}</span>
                    </div>
                    <p className="text-gray-700 mb-6">{job.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                    <ul className="space-y-2">
                      {job.requirements.map((req, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                          <span className="text-blue-500 mt-1">•</span>
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Benefits</h4>
                    <ul className="space-y-2">
                      {job.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                          <span className="text-green-500 mt-1">✓</span>
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                  <span className="text-sm text-gray-500">
                    Posted {new Date(job.postedDate).toLocaleDateString()}
                  </span>
                  <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all">
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Application Process */}
        <section className="mt-16 bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Hiring Process</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 font-bold text-lg">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Application Review</h3>
              <p className="text-sm text-gray-600">We carefully review your application and portfolio</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 font-bold text-lg">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Technical Interview</h3>
              <p className="text-sm text-gray-600">Discuss your experience and technical skills</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 font-bold text-lg">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Team Fit</h3>
              <p className="text-sm text-gray-600">Meet the team and discuss company culture</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-orange-600 font-bold text-lg">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Offer & Onboarding</h3>
              <p className="text-sm text-gray-600">Welcome to the Garlaws family!</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="mt-16 text-center">
          <div className="bg-gradient-to-r from-gray-900 to-black rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Join Us?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Don't see a perfect match? We're always interested in meeting talented individuals.
              Send us your resume and let's start a conversation.
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-800 transition-all shadow-lg">
              Send Spontaneous Application
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
'use client';

import { useSession } from 'next-auth/react';
import { isKnownRole } from '@/lib/roles';
import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { FcGoogle } from 'react-icons/fc';

export default function Home() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.role && isKnownRole(session.user.role)) {
      window.location.href = `/${session.user.role}`;
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/",
      });

      if (!result) {
        setError("No response from server. Please try again.");
        return;
      }

      if (result.error) {
        setError(result.error || "Invalid email or password.");
      } else if (result.ok) {
        setIsModalOpen(false);
        window.location.href = result.url || "/";
      } else {
        setError("Unexpected error occurred. Please try again.");
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    await signIn('google', { callbackUrl: '/' });
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen font-sans">
      {/* Enhanced Navbar */}
      <nav className="bg-white/95 backdrop-blur-md shadow-sm fixed w-full z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2.5 rounded-xl shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  MediCore HMS
                </h1>
                <p className="text-xs text-gray-500 font-medium">University Healthcare</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-1">
              <a href="#home" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">Home</a>
              <a href="#features" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">Features</a>
              <a href="#roles" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">Roles</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg text-sm font-medium transition-all">Contact</a>
            </div>

            <div className="hidden md:block">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 hover:from-blue-700 hover:to-indigo-700"
              >
                Login
              </button>
            </div>

            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-3 space-y-2">
              <a href="#home" className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg">Home</a>
              <a href="#features" className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg">Features</a>
              <a href="#roles" className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg">Roles</a>
              <a href="#contact" className="block text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg">Contact</a>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header id="home" className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-indigo-600/5 to-purple-600/5"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
                <span>Trusted by University Health Centers Nationwide</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                University Healthcare
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Made Simple & Smart
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Complete healthcare management for university campuses. From student consultations to lab reports, medicine dispensing to inventory tracking—all in one intelligent platform.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-semibold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
                >
                  Get Started
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all">
                  Watch Demo
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Students</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">5 Mins</div>
                  <div className="text-sm text-gray-600">Avg. Visit</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Accessible</div>
                </div>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Google Sign-In</div>
                      <div className="text-xs text-gray-500">University email login</div>
                    </div>
                    <div className="text-green-600 font-bold">✓</div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Digital Prescriptions</div>
                      <div className="text-xs text-gray-500">Instant access anytime</div>
                    </div>
                    <div className="text-green-600 font-bold">✓</div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
                    <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">Smart Inventory</div>
                      <div className="text-xs text-gray-500">Real-time stock tracking</div>
                    </div>
                    <div className="text-green-600 font-bold">✓</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -z-10 top-10 right-10 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
              <div className="absolute -z-10 bottom-10 left-10 w-72 h-72 bg-indigo-200 rounded-full blur-3xl opacity-30"></div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span>Comprehensive Features</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for Campus Healthcare</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Seamless workflows from student check-in to medicine dispensing—designed specifically for university health centers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
                title: "Google OAuth Login",
                description: "Students login instantly using their university Gmail. No manual registration needed—just click and access your health records.",
                color: "blue"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
                title: "Smart Prescription Flow",
                description: "From nurse check-in to doctor prescription to pharmacist dispensing—track every step with real-time status updates.",
                color: "indigo"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                ),
                title: "Intelligent Inventory",
                description: "Real-time medicine stock tracking with automatic deductions, low-stock alerts, and bulk Excel import/export for pharmacists.",
                color: "purple"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "Lab Test Management",
                description: "Doctors request tests digitally, lab techs upload results, and students access reports instantly—all in one platform.",
                color: "green"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
                title: "Real-Time Notifications",
                description: "Instant alerts for new prescriptions, lab reports ready, and low medicine stock—keep everyone in the loop.",
                color: "yellow"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Admin Analytics Dashboard",
                description: "Comprehensive insights on prescriptions, inventory trends, staff performance, and student visit patterns at a glance.",
                color: "red"
              }
            ].map((feature, index) => (
              <div key={index} className="group bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div className={`inline-flex p-4 bg-${feature.color}-100 rounded-xl text-${feature.color}-600 mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Health Tips Section */}
      <section id="health-tips" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span>Student Wellness</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Campus Health Tips</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Simple, evidence-based tips to help students stay healthy throughout the academic year</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Hydration */}
            <div className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-blue-100 text-blue-700 text-2xl">💧</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Stay Hydrated</h3>
                  <p className="text-gray-600 mt-1 text-sm">Carry a water bottle to class. Aim for 6–8 glasses daily to boost focus and energy.</p>
                </div>
              </div>
            </div>

            {/* Hand Hygiene */}
            <div className="group bg-gradient-to-br from-indigo-50 to-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-indigo-100 text-indigo-700 text-2xl">🧼</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Practice Hand Hygiene</h3>
                  <p className="text-gray-600 mt-1 text-sm">Wash hands for 20 seconds before meals and after class to prevent illness spread.</p>
                </div>
              </div>
            </div>

            {/* Sleep */}
            <div className="group bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-100 text-purple-700 text-2xl">😴</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Prioritize Sleep</h3>
                  <p className="text-gray-600 mt-1 text-sm">Get 7–9 hours of sleep for better memory, focus, and overall academic performance.</p>
                </div>
              </div>
            </div>

            {/* Vaccination */}
            <div className="group bg-gradient-to-br from-amber-50 to-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-amber-100 text-amber-700 text-2xl">💉</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Keep Vaccinations Current</h3>
                  <p className="text-gray-600 mt-1 text-sm">Check with campus health center about required immunizations and boosters.</p>
                </div>
              </div>
            </div>

            {/* Check-ups */}
            <div className="group bg-gradient-to-br from-emerald-50 to-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700 text-2xl">🩺</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Regular Check-ups</h3>
                  <p className="text-gray-600 mt-1 text-sm">Visit the health center for routine screenings and early detection of health issues.</p>
                </div>
              </div>
            </div>

            {/* Medication Adherence */}
            <div className="group bg-gradient-to-br from-rose-50 to-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-rose-100 text-rose-700 text-2xl">💊</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Follow Prescriptions</h3>
                  <p className="text-gray-600 mt-1 text-sm">Take medicines as prescribed and consult campus pharmacist with any questions.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-block px-8 py-3 rounded-xl bg-green-600 text-white font-semibold shadow-lg hover:bg-green-700 hover:shadow-xl transition-all transform hover:scale-105"
            >
              Access Your Health Records
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">50K+</div>
              <div className="text-blue-100 font-medium">Students Served</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">5 Min</div>
              <div className="text-blue-100 font-medium">Average Visit Time</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">100%</div>
              <div className="text-blue-100 font-medium">Digital Records</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">24/7</div>
              <div className="text-blue-100 font-medium">Access Anytime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-xl">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">MediCore HMS</span>
              </div>
              <p className="text-gray-400 text-sm">Transforming university healthcare management with intelligent, student-centered solutions.</p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#roles" className="hover:text-white transition">Roles</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
                <li><a href="#" className="hover:text-white transition">Integrations</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">HIPAA Compliance</a></li>
                <li><a href="#" className="hover:text-white transition">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">&copy; 2025 MediCore HMS. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Enhanced Login Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
                  <p className="text-blue-100 text-sm mt-1">Sign in to access your dashboard</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-white/80 hover:text-white transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Tabs */}
              <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setActiveTab('credentials')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'credentials'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Email & Password
                </button>
                <button
                  onClick={() => setActiveTab('google')}
                  className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === 'google'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Google Sign-In
                </button>
              </div>

              {/* Credentials Form */}
              {activeTab === 'credentials' ? (
                <form onSubmit={handleSubmitCredentials} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
                      >
                        {showPassword ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                      <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] ${
                      loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>

                  <div className="text-center">
                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      Forgot your password?
                    </a>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <p className="text-center text-gray-600 text-sm mb-6">
                    Students: Sign in with your university Gmail account
                  </p>
                  
                  <button
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 text-gray-700 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all transform hover:scale-[1.02] shadow-sm"
                  >
                    <FcGoogle className="text-2xl" />
                    {loading ? 'Connecting...' : 'Continue with Google'}
                  </button>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-6">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-800">
                        Use your university email (e.g., rr200137@rgukitrkv.ac.in) to automatically access your health records.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
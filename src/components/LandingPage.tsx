import React, { useState } from "react";
import {
  ShoppingCart,
  Star,
  Download,
  ArrowRight,
  ArrowUp,
  Facebook,
  Instagram,
  Twitter,
  Apple,
  UtensilsCrossed,
  Coffee,
  Circle,
  Store,
  Apple as AppleIcon,
  Package,
  Utensils,
  Square,
  Droplet,
  X,
  Smartphone,
} from "lucide-react";

export default function LandingPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const categories = [
    { icon: Circle, label: "Vegetables", color: "text-green-600" },
    { icon: AppleIcon, label: "Fruits", color: "text-red-600" },
    { icon: Coffee, label: "Beverages", color: "text-red-600" },
    { icon: Package, label: "Snacks", color: "text-yellow-600" },
    { icon: Square, label: "Meat", color: "text-red-600" },
    { icon: Utensils, label: "Bakery", color: "text-yellow-600" },
    { icon: Droplet, label: "Dairy", color: "text-blue-600" },
    { icon: Store, label: "Pantry", color: "text-green-600" },
  ];

  const products = [
    {
      type: "GROCERY",
      typeColor: "bg-red-500",
      rating: 4.8,
      image: "https://t3.ftcdn.net/jpg/18/42/89/34/240_F_1842893495_9vLBrbA7Vpopkg2kM4nrsZ2mQNpLioTx.jpg",
      store: "GROCYON FRESH STORE",
      item: "Organic Vine Tomatoes",
      price: "$4.50",
    },
    {
      type: "FOOD",
      typeColor: "bg-yellow-500",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&q=80&w=800",
      store: "BURGER LOUNGE",
      item: "Signature Beef Burger",
      price: "$12.99",
    },
    {
      type: "GROCERY",
      typeColor: "bg-red-500",
      rating: 4.7,
      image: "https://c7.alamy.com/comp/KYTFN1/whole-foods-market-bryant-park-nyc-usa-KYTFN1.jpg",
      store: "GROCYON FRESH STORE",
      item: "Whole Farm Milk (1L)",
      price: "$2.49",
    },
    {
      type: "FOOD",
      typeColor: "bg-yellow-500",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80&w=800",
      store: "ZAITOON HERITAGE",
      item: "Chicken Dum Biryani",
      price: "$15.50",
    },
    {
      type: "GROCERY",
      typeColor: "bg-red-500",
      rating: 4.5,
      image: "https://media.gettyimages.com/id/157532732/photo/bell-peppers-in-shipping-box.jpg?s=2048x2048&w=gi&k=20&c=c1FO8ZyAF5sa8MaS4Hvbh3PbKn4JcZ8XAHCl9aBNxLI=",
      store: "GROCYON FRESH STORE",
      item: "Fresh Bell Peppers",
      price: "$3.99",
    },
    {
      type: "FOOD",
      typeColor: "bg-yellow-500",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800",
      store: "PIZZA MASTER",
      item: "Stone Oven Pizza",
      price: "$18.99",
    },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <img
                src="/image/logo/logo_icon.jpeg"
                alt="Grocyon Logo"
                className="w-10 h-10 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/image/logo/icon.jpeg";
                }}
              />
              <span className="text-2xl font-bold text-black">Grocyon</span>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-gray-700 hover:text-red-500 hover:font-semibold transition-all duration-300 relative group"
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
              </button>
              <a href="#download" className="text-gray-700 hover:text-red-500 hover:font-semibold transition-all duration-300 relative group">
                Download App
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            </nav>

            {/* Download Button */}
            <button className="group flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/50 hover:scale-105 transition-all duration-300">
              <Download className="w-5 h-5 group-hover:animate-bounce" />
              <span className="hidden sm:inline">Download App</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl lg:text-8xl xl:text-9xl 2xl:text-[10rem] font-bold leading-tight">
              <span className="text-black">Eat </span>
              <span className="text-red-500">Fresh </span>
              <span className="text-black">Live </span>
              <span className="font-bold" style={{ color: '#FFE842' }}>Best</span>
            </h1>
            <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
              Grocyon brings you the finest selection of hand-picked groceries
              and mouth-watering dishes from premium restaurants.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => setShowModal(true)}
                className="group flex items-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/50 hover:scale-105 transition-all duration-300 font-medium"
              >
                <span>Start Your Journey</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5" style={{ fill: '#FFE842', color: '#FFE842' }} />
                  ))}
                </div>
                <span className="text-gray-700 font-medium">5.0 Rating</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-6">
              <div 
                onClick={() => setShowModal(true)}
                className="group p-4 rounded-lg flex items-center space-x-3 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer" 
                style={{ backgroundColor: 'rgba(255, 232, 66, 0.1)' }}
              >
                <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform" style={{ color: '#FFE842' }} />
                <span className="font-medium text-gray-800">Premium Groceries</span>
              </div>
              <div 
                onClick={() => setShowModal(true)}
                className="group bg-red-100 p-4 rounded-lg flex items-center space-x-3 hover:bg-red-200 hover:shadow-md hover:scale-105 transition-all duration-300 cursor-pointer"
              >
                <UtensilsCrossed className="w-6 h-6 text-red-600 group-hover:scale-110 transition-transform" />
                <span className="font-medium text-gray-800">Top Restaurants</span>
              </div>
            </div>
          </div>

          {/* Right Images */}
          <div className="relative">
            <div className="relative z-10">
              <div className="overflow-hidden rounded-2xl shadow-lg group">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800"
                  alt="Fresh produce"
                  className="w-full h-64 md:h-80 lg:h-96 object-cover bg-gray-200 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-48 md:w-56 h-48 md:h-56 rounded-2xl shadow-xl overflow-hidden z-20 bg-gray-200 group">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800"
                  alt="Food dish"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
            </div>
            <div className="absolute bottom-0 right-0 px-4 py-2 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer" style={{ backgroundColor: '#FFE842' }}>
              <span className="font-medium text-gray-900">Fast Delivery Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Categories Section */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
                Explore Categories
              </h2>
              <p className="text-gray-600">Find exactly what you're looking for</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="group text-red-500 font-medium hover:text-red-600 hover:underline mt-4 md:mt-0 inline-flex items-center space-x-1 transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="flex flex-col items-center space-y-2 cursor-pointer group"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white flex items-center justify-center shadow-md group-hover:shadow-xl group-hover:scale-110 group-hover:bg-gray-50 transition-all duration-300">
                  <category.icon className={`w-8 h-8 md:w-10 md:h-10 ${category.color} group-hover:scale-125 transition-transform duration-300`} />
                </div>
                <span className="text-xs md:text-sm text-gray-700 text-center font-medium group-hover:text-gray-900 group-hover:font-semibold transition-all">
                  {category.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Right Now Section */}
      <section id="categories" className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
                <span className="text-black">Popular </span>
                <span className="text-red-500">Right Now</span>
              </h2>
              <p className="text-gray-600">
                Discover top-rated meals and fresh essentials curated just for you.
              </p>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              {["All", "Grocery", "Food"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    activeFilter === filter
                      ? "bg-gray-800 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 hover:shadow-md"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {products
              .filter(
                (product) =>
                  activeFilter === "All" ||
                  (activeFilter === "Grocery" && product.type === "GROCERY") ||
                  (activeFilter === "Food" && product.type === "FOOD")
              )
              .map((product, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden group cursor-pointer"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.item}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span
                        className={`${product.typeColor} text-white text-xs font-bold px-3 py-1 rounded-full`}
                      >
                        {product.type}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center space-x-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full">
                      <Star className="w-4 h-4" style={{ fill: '#FFE842', color: '#FFE842' }} />
                      <span className="text-sm font-medium text-gray-800">
                        {product.rating}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <p className="text-xs text-gray-500 font-medium uppercase">
                      {product.store}
                    </p>
                    <h3 className="text-lg font-bold text-gray-900">{product.item}</h3>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xl font-bold text-gray-900 group-hover:text-red-500 transition-colors">{product.price}</span>
                      <button 
                        onClick={() => setShowModal(true)}
                        className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 hover:scale-110 hover:shadow-lg transition-all duration-300 font-medium"
                      >
                        Add +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
          <div className="text-center mt-8">
            <button 
              onClick={() => setShowModal(true)}
              className="group bg-white border-2 border-gray-300 text-gray-800 px-8 py-3 rounded-lg hover:border-red-500 hover:text-red-500 hover:shadow-lg hover:scale-105 transition-all duration-300 font-medium"
            >
              <span className="inline-flex items-center space-x-2">
                <span>Explore Complete Menu</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Mobile App Promotion Section */}
      <section id="download" className="relative py-12 md:py-20 rounded-t-3xl mt-12 overflow-hidden bg-black">
        {/* Red Glow Effect */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.1) 40%, transparent 70%)'
          }}
        ></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/30 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-16 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="space-y-6 text-white">
              <div className="inline-block">
                <span className="text-gray-900 text-xs font-bold px-4 py-2 rounded-lg uppercase flex items-center space-x-2" style={{ backgroundColor: '#FFE842' }}>
                  <Star className="w-3 h-3 fill-gray-900 text-gray-900" />
                  <span>EXCLUSIVE MOBILE EXPERIENCE</span>
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Get the <span className="text-red-500">Grocyon</span> App For{" "}
                <span style={{ color: '#FFE842' }}>Seamless</span> Experience
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Download the Grocyon Android app to unlock a world of convenience. Track
                your orders live and enjoy exclusive app-only deals.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button className="group flex items-center space-x-3 bg-white text-gray-900 px-6 py-4 rounded-lg hover:bg-gray-100 hover:shadow-xl hover:scale-105 transition-all duration-300 font-medium shadow-lg">
                  <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.96-3.24-1.44-1.56-.62-2.46-1.1-3.21-2.27C6.93 16.07 6.43 14.88 6.5 13.58c.08-1.3.67-2.43 1.95-3.04.73-.35 1.55-.5 2.33-.5.66 0 1.29.09 1.88.27 1.17.36 2.23.81 3.33 1.29.31.13.63.26.96.39.11.04.24.05.37.02.24-.05.49-.1.73-.16.14-.03.28-.04.42-.04.51.03 1 .11 1.46.32 1.39.63 2.04 1.81 2.04 3.37 0 1.04-.37 1.88-1.11 2.52-.74.64-1.65.96-2.73.96h-.23c-.53-.01-1.06-.07-1.58-.2-.99-.26-1.97-.58-2.94-.93z"/>
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-xs text-gray-600">AVAILABLE ON</div>
                    <div className="text-base font-bold">Google Play</div>
                  </div>
                </button>
                <div className="flex items-center space-x-3 bg-black/50 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5"
                        style={{ fill: '#FFE842', color: '#FFE842' }}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-white">4.9/5 Rating</span>
                </div>
              </div>
            </div>
            <div className="relative flex justify-center">
              <div className="relative group">
                {/* Phone Frame with Red Glow */}
                <div className="w-48 h-96 md:w-56 md:h-[28rem] bg-gray-800 rounded-3xl p-4 shadow-2xl border border-gray-700 group-hover:scale-105 transition-all duration-300 relative" style={{ boxShadow: '0 0 30px rgba(239, 68, 68, 0.5)' }}>
                  <div className="w-full h-full bg-gray-900 rounded-2xl overflow-hidden relative">
                    {/* Phone Screen Content */}
                    <div className="absolute inset-0 flex items-center justify-center p-4">
                      <div className="w-full space-y-4">
                        {/* Notification Bubble */}
                        <div className="relative">
                          <div className="px-4 py-3 rounded-xl space-y-1" style={{ backgroundColor: '#FFE842' }}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Download className="w-4 h-4 text-gray-900" />
                                <span className="text-xs font-bold text-gray-900">Order Status</span>
                              </div>
                            </div>
                            <p className="text-xs text-gray-900">Food arriving in 5 mins!</p>
                          </div>
                        </div>
                        {/* App Icons Grid */}
                        <div className="grid grid-cols-4 gap-3 mt-4">
                          {[...Array(12)].map((_, i) => (
                            <div key={i} className="aspect-square bg-gray-800 rounded-xl flex items-center justify-center">
                              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg"></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Logo and Tagline */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <img
                  src="/image/logo/logo_icon.jpeg"
                  alt="Grocyon Logo"
                  className="w-10 h-10 rounded-lg object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/image/logo/icon.jpeg";
                  }}
                />
                <span className="text-2xl font-bold text-black">Grocyon</span>
              </div>
              <p className="text-gray-600 text-sm">
                Your favorite food and grocery delivery partner. Fast, reliable, and always
                fresh.
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm">Platform</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-gray-600 hover:text-red-500 transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <a
                    href="#download"
                    className="text-gray-600 hover:text-red-500 transition-colors"
                  >
                    Download App
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/privacy-policy" className="text-gray-600 hover:text-red-500 transition-colors">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>

            {/* Connect Links */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 uppercase text-sm">Connect</h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-300"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-300"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white hover:scale-110 hover:shadow-lg transition-all duration-300"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © 2026 Grocyon. Enjoy your journey
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <span className="text-gray-600 text-sm font-medium">PROUDLY LOCAL</span>
              <button
                onClick={scrollToTop}
                className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 hover:scale-110 hover:shadow-lg transition-all duration-300"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile App Required Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setShowModal(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 md:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Icon - Centered */}
            <div className="mb-6 flex justify-center">
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center relative"
                style={{ backgroundColor: '#FFE842' }}
              >
                <Smartphone className="w-8 h-8 text-white" />
                <div className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
            </div>

            {/* Title - Centered */}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 text-center">
              Mobile App Required
            </h2>

            {/* Body Text - Centered */}
            <p className="text-gray-600 mb-6 leading-relaxed text-center">
              Please continue this process on your mobile device. First,{" "}
              <span className="text-red-500 font-semibold">Download Grocyon</span>{" "}
              and enjoy your seamless shopping journey!
            </p>

            {/* Download Button - Centered */}
            <div className="flex justify-center mb-4">
              <button 
                onClick={() => {
                  // You can add download link here
                  window.open('https://play.google.com/store', '_blank');
                }}
                className="flex items-center justify-center space-x-2 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl"
              >
                <Download className="w-5 h-5" />
                <span>Download Android App</span>
              </button>
            </div>

            {/* Secondary Action - Centered */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm transition-colors"
              >
                Wait, I'll download later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

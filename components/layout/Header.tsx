'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiMenu, FiX, FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/ui/UserMenu';
import { UserProfile } from '@/lib/stores/authStore';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'Our Divisions', href: '/divisions' },
  { name: 'Products & Services', href: '/products' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export const Header: React.FC = () => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, profile: userProfile } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { getTotalItems } = useCart();

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // trigger after scrolling 50px
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${isScrolled
        ? 'bg-gradient-blue border-rare-border/30 shadow-md' // midnight blue
        : 'bg-rare-background border-rare-border/20'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-4 md:py-6 relative">
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 hover:bg-rare-primary-light rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <FiX className={`h-6 w-6 ${isScrolled ? 'text-white' : 'text-rare-primary'}`} />
              ) : (
                <FiMenu className={`h-6 w-6 ${isScrolled ? 'text-white' : 'text-rare-primary'}`} />
              )}
            </button>
          </div>

          {/* Desktop Navigation (Left) */}
          <nav className="hidden md:flex gap-8 flex-1">
            {navigation.slice(0, 3).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-xs font-body font-normal tracking-rare-nav uppercase transition-opacity ${isScrolled
                  ? 'text-white hover:opacity-80'
                  : 'text-rare-primary hover:opacity-70'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <img
                src="/logo.png"
                alt="Beyond Realms Logo"
                className={`h-10 w-auto transition-all duration-300 ${
                  isScrolled 
                    ? 'brightness-200' 
                    : 'brightness-0' // Force black/dark if background is light
                }`}
              />
            </Link>
          </div>

          {/* Desktop Navigation (Right) */}
          <nav className="hidden md:flex gap-8 flex-1 justify-end">
            {navigation.slice(3).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-xs font-body font-normal tracking-rare-nav uppercase transition-opacity ${isScrolled
                  ? 'text-white hover:opacity-80'
                  : 'text-rare-primary hover:opacity-70'
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Icons & Auth */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="p-2 hover:bg-rare-primary-light rounded-lg transition-colors"
              aria-label="Search"
            >
              <FiSearch
                className={`h-5 w-5 transition-colors ${isScrolled ? 'text-white' : 'text-rare-primary'
                  }`}
              />
            </button>
            <Link
              href="/cart"
              className="p-2 hover:bg-rare-primary-light rounded-lg transition-colors relative block"
              aria-label="Shopping cart"
            >
              <FiShoppingCart
                className={`h-5 w-5 transition-colors ${isScrolled ? 'text-white' : 'text-rare-primary'
                  }`}
              />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-rare-accent text-rare-primary text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {getTotalItems()}
                </span>
              )}
            </Link>

            {/* User Auth Section */}
            {user ? (
              <div className="flex items-center gap-3">
                {/* User Display Name */}
                <span className={`hidden sm:block text-xs font-body font-semibold uppercase tracking-wider ${isScrolled ? 'text-white' : 'text-rare-primary'}`}>
                  {userProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                </span>
                
                <div className="relative">
                  <button
                    ref={profileButtonRef}
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="p-2 hover:bg-rare-primary-light rounded-lg transition-colors relative"
                    aria-label="User menu"
                  >
                    {userProfile?.avatar_url ? (
                      <img
                        src={userProfile.avatar_url}
                        alt={userProfile.full_name || user?.user_metadata?.full_name || user.email || 'User'}
                        className={`h-8 w-8 rounded-full object-cover border-2 ${isScrolled ? 'border-white' : 'border-rare-primary'
                          }`}
                      />
                    ) : (
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center font-body font-semibold text-xs border transition-colors ${
                          isScrolled
                            ? 'bg-white text-rare-primary border-transparent'
                            : 'bg-rare-primary text-white border-rare-primary'
                        }`}
                      >
                        {(userProfile?.full_name || user?.user_metadata?.full_name)
                          ? (userProfile?.full_name || user?.user_metadata?.full_name)
                            .trim()
                            .split(' ')
                            .map((n: any) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()
                          : user?.email?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                  </button>
                  <UserMenu
                    user={user}
                    profile={userProfile}
                    isOpen={profileMenuOpen}
                    onClose={() => setProfileMenuOpen(false)}
                    anchorEl={profileButtonRef.current}
                  />
                </div>
              </div>
            ) : (
              <Link
                href="/signin"
                className={`px-4 py-2 rounded-lg text-xs font-body font-normal tracking-rare-nav uppercase transition-colors border ${isScrolled
                  ? 'bg-white text-rare-primary hover:bg-white/90 border-white'
                  : 'bg-transparent text-rare-primary hover:bg-rare-primary hover:text-white border-rare-primary'
                  }`}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Search Dropdown */}
        {isSearchOpen && (
          <div className={`py-4 md:py-6 border-t animate-in fade-in slide-in-from-top-2 duration-300 ${
            isScrolled ? 'border-white/10' : 'border-rare-border/10'
          }`}>
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto flex items-center gap-4 px-4">
              <FiSearch className={`h-5 w-5 ${isScrolled ? 'text-white' : 'text-rare-primary'}`} />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`flex-1 bg-transparent border-none focus:ring-0 font-body text-lg md:text-xl ${
                  isScrolled ? 'text-white placeholder:text-white/50' : 'text-rare-primary placeholder:text-rare-primary/50'
                }`}
              />
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className={`p-2 hover:bg-rare-primary-light rounded-lg transition-colors ${
                  isScrolled ? 'text-white' : 'text-rare-primary'
                }`}
              >
                <FiX className="h-6 w-6" />
              </button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-body px-4 py-2 rounded-lg transition-colors ${isScrolled
                    ? 'text-white hover:bg-white/10'
                    : 'text-rare-primary hover:bg-rare-primary-light'
                    }`}
                >
                  {item.name}
                </Link>
              ))}
              {/* Mobile Auth Links */}
              {user ? (
                <div className="px-4 py-3 border-t border-rare-border/10 mt-2">
                  <p className={`text-[10px] font-body font-medium uppercase tracking-[0.2em] mb-1 ${isScrolled ? 'text-white/60' : 'text-rare-primary/60'}`}>
                    Account
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-body font-semibold text-[10px] ${isScrolled
                      ? 'bg-white text-rare-primary'
                      : 'bg-rare-primary text-white'
                      }`}>
                      {(userProfile?.full_name || user?.user_metadata?.full_name)
                        ? (userProfile?.full_name || user?.user_metadata?.full_name)
                          .trim()
                          .split(' ')
                          .map((n: any) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                        : user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className={`text-sm font-body font-semibold truncate max-w-[150px] ${isScrolled ? 'text-white' : 'text-rare-primary'}`}>
                        {userProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0]}
                      </p>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-[10px] font-body hover:underline ${isScrolled ? 'text-white/70' : 'text-rare-primary/70'}`}
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href="/signin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-body px-4 py-2 rounded-lg transition-colors ${isScrolled
                    ? 'bg-white text-rare-primary hover:bg-white/90'
                    : 'bg-rare-primary text-white hover:bg-rare-secondary'
                    }`}
                >
                  Sign In
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

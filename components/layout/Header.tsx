'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FiMenu, FiX, FiSearch, FiShoppingCart, FiUser } from 'react-icons/fi';
import { useCart } from '@/contexts/CartContext';
import { UserMenu } from '@/components/ui/UserMenu';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/lib/supabase';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About Us', href: '/about' },
  { name: 'Our Divisions', href: '/divisions' },
  { name: 'Products & Services', href: '/products' },
  { name: 'Blog', href: '/blog' },
  { name: 'Contact', href: '/contact' },
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const { getTotalItems } = useCart();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50); // trigger after scrolling 50px
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        // Only log non-permission errors (RLS might prevent access)
        if (error.code !== 'PGRST301' && error.code !== '42501') {
          console.error('Error fetching user profile:', error);
        }
        setUserProfile(null);
        return;
      }

      // Set profile data if exists, otherwise null (profile should be created during signup)
      setUserProfile(data || null);
    } catch (error: any) {
      // Silently handle errors - profile might not exist yet or RLS might prevent access
      setUserProfile(null);
    }
  };

  // Auth state management
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-500 ${isScrolled
        ? 'bg-gradient-blue border-rare-border/30 shadow-md' // midnight blue
        : 'bg-rare-background border-rare-border/20'
        }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4 py-4 md:py-6">
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
                className={`h-10 w-auto transition-transform duration-300 ${isScrolled ? 'brightness-200' : ''
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
                      alt={userProfile.full_name || user.email || 'User'}
                      className={`h-8 w-8 rounded-full object-cover border-2 ${isScrolled ? 'border-white' : 'border-rare-primary'
                        }`}
                    />
                  ) : (
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-body font-semibold text-xs ${isScrolled
                        ? 'bg-white text-rare-primary'
                        : 'bg-rare-primary text-white'
                        }`}
                    >
                      {userProfile?.full_name
                        ? userProfile.full_name
                          .trim()
                          .split(' ')
                          .map((n) => n[0])
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
            ) : (
              <Link
                href="/signin"
                className={`px-4 py-2 rounded-lg text-xs font-body font-normal tracking-rare-nav uppercase transition-colors ${isScrolled
                  ? 'bg-white text-rare-primary hover:bg-white/90'
                  : 'bg-rare-primary text-white hover:bg-rare-secondary'
                  }`}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

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
              {!user && (
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

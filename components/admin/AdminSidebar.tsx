'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiBox, FiShoppingCart, FiUsers, FiMessageSquare, FiSettings, FiLogOut, FiTrendingUp, FiTag, FiStar } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const navigation = [
    { name: 'Dashboard', href: '/admin', icon: FiGrid },
    { name: 'Orders', href: '/admin/orders', icon: FiShoppingCart },
    {
        name: 'Products',
        href: '/admin/products',
        icon: FiBox,
        children: [
            { name: 'All Products', href: '/admin/products' },
            { name: 'Add New', href: '/admin/products/create' },
            { name: 'Categories', href: '/admin/products/categories' },
            { name: 'Tags', href: '/admin/products/tags' },
        ]
    },
    { name: 'Customers', href: '/admin/customers', icon: FiUsers },
    { name: 'Analytics', href: '/admin/analytics', icon: FiTrendingUp },
    { name: 'Marketing', href: '/admin/marketing', icon: FiTag },
    { name: 'Reviews', href: '/admin/reviews', icon: FiStar },
    { name: 'Messages', href: '/admin/contact', icon: FiMessageSquare },
    { name: 'Settings', href: '/admin/settings', icon: FiSettings },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();
    const { settings } = useSiteSettings();

    return (
        <div className="hidden lg:flex flex-col w-72 bg-white/80 backdrop-blur-xl border-r border-white/20 h-screen sticky top-0 shadow-2xl shadow-rare-primary/5">
            <div className="p-8 border-b border-rare-primary/5">
                <Link href="/" className="flex items-center gap-4">
                    <img
                        src={settings?.logo_url || "/logo.png"}
                        alt={settings?.site_name || "Beyond Realms"}
                        className="h-10 w-auto drop-shadow-md"
                    />
                    <div className="flex flex-col">
                        <span className="font-heading font-bold text-rare-primary text-lg tracking-wide leading-none">BEYOND</span>
                        <span className="font-heading text-rare-secondary text-xs tracking-[0.2em] mt-1">REALMS</span>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
                <p className="px-4 text-xs font-bold text-rare-text-light/50 uppercase tracking-widest mb-4">Menu</p>
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.children && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                        <div key={item.name}>
                            <Link
                                href={item.href}
                                className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive && !item.children
                                    ? 'bg-rare-primary text-white shadow-lg shadow-rare-primary/25 translate-x-1'
                                    : 'text-rare-text-light hover:bg-white hover:text-rare-primary hover:shadow-md hover:shadow-rare-primary/5'
                                    } ${isActive && item.children ? 'bg-white text-rare-primary shadow-md' : ''}`}
                            >
                                <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                                <span className="font-body tracking-wide">{item.name}</span>
                                {isActive && !item.children && (
                                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />
                                )}
                            </Link>

                            {/* Submenu */}
                            {item.children && isActive && (
                                <div className="mt-1 ml-4 pl-4 border-l-2 border-rare-primary/10 space-y-1">
                                    {item.children.map(child => {
                                        const isChildActive = pathname === child.href;
                                        return (
                                            <Link
                                                key={child.name}
                                                href={child.href}
                                                className={`block px-4 py-2 text-sm rounded-lg transition-colors ${isChildActive ? 'text-rare-primary font-bold bg-rare-primary/5' : 'text-gray-500 hover:text-rare-primary hover:bg-gray-50'}`}
                                            >
                                                {child.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            <div className="p-6 border-t border-rare-primary/5 bg-gradient-to-t from-white/50 to-transparent">
                <button
                    onClick={signOut}
                    className="group flex items-center gap-3 px-4 py-3.5 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:shadow-inner transition-all duration-300"
                >
                    <div className="p-2 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                        <FiLogOut className="h-4 w-4" />
                    </div>
                    <span className="font-body">Sign Out</span>
                </button>
            </div>
        </div>
    );
}

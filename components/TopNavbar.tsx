  'use client';

  /**
   * TopNavbar
   *
   * - A gradient accent bar at the top
   * - A logo and app title on the left
   * - Pill-style navigation tabs on the right (desktop)
   * - A collapsible hamburger menu for mobile view
   *
   * Each tab links to a different page and highlights when active.
   * Icons are provided via lucide-react for visual clarity.
   */

  import { useState } from 'react';
  import {
    Menu,         // Hamburger icon for mobile menu
    X,            // Close icon for mobile menu
    Zap,          // Logo icon
    MapPin,       // Icon for facility map tab
    Table,        // Icon for country capacity tab
    TrendingUpDown, // Icon for generation over time tab
    Globe  ,     // Icon for fuel capacity tab
  } from 'lucide-react';
  import Link from 'next/link';
  import { usePathname } from 'next/navigation';

  // Navigation tab definitions
  const links = [
    {
      name: 'World Facility Map',
      href: '/facility-map',
      icon: MapPin,
      stroke: 'stroke-blue-900',
      fill: 'fill-white',
    },
    {
      name: 'World Capacity by Fuel',
      href: '/capacity-by-fuel',
      icon: Globe  ,
      stroke: 'stroke-blue-800',
      fill: 'fill-white',
    },
    {
      name: 'Capacity by Country',
      href: '/country-capacity',
      icon: Table,
      stroke: 'stroke-blue-900',
      fill: 'fill-white',
    },
    {
      name: 'Generation over Time',
      href: '/country-compare',
      icon: TrendingUpDown,
      stroke: 'stroke-blue-600',
      fill: 'fill-white',
    },

  ];

  export default function TopNavbar() {
    const pathname = usePathname(); // Get current route path
    const [isOpen, setIsOpen] = useState(false); // Track mobile menu open/closed

    return (
      <nav className="">
        {/* Top accent bar (blue gradient) */}
        <div className="h-1 w-full bg-blue-900" />

        {/* Main navigation header */}
        <div className="h-16 flex items-center justify-between px-4 bg-white">
          {/* Left side: Logo and app title */}
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-blue-800" />
            <span className="font-bold text-xl text-neutral-800 whitespace-nowrap">
              World Power Tracker
            </span>
          </div>

          {/* Right side: Desktop navigation tabs */}
          <div className="hidden md:flex items-center gap-3">
            {links.map(({ name, href, icon: Icon, stroke, fill }) => {
              const isActive = pathname === href; // Highlight tab if current route

              return (
                <Link key={name} href={href}>
                  <span
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-200
                      ${
                        isActive
                          ? 'bg-blue-800 text-white border-blue-900' // Active tab style
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-800 hover:text-blue-900' // Inactive tab style
                      }`}
                  >
                    <Icon
                      size={16}
                      strokeWidth={2}
                      className={`${stroke} ${fill}`} // Icon styling
                    />
                    <span className="whitespace-nowrap text-sm font-medium">
                      {name}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Mobile menu toggle button (hamburger or close icon) */}
          <button
            className="md:hidden text-gray-700 hover:text-blue-900"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu panel (shown when isOpen is true) */}
        {isOpen && (
          <div className="md:hidden px-4 py-2 border-t border-gray-200 bg-white shadow-sm">
            {links.map(({ name, href, icon: Icon, stroke, fill }) => {
              const isActive = pathname === href;

              return (
                <Link key={name} href={href} onClick={() => setIsOpen(false)}>
                  <div
                    className={`flex items-center gap-2 py-2 text-sm font-semibold
                      ${
                        isActive
                          ? 'text-blue-900' // Active tab style
                          : 'text-gray-700 hover:text-blue-800' // Inactive tab style
                      }`}
                  >
                    <Icon
                      size={16}
                      strokeWidth={2}
                      className={`${stroke} ${fill}`} // Icon styling
                    />
                    {name}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    );
  }
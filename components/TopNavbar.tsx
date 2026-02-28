'use client';

import { useState } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Zap, MapPin, Globe, Table, TrendingUpDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { name: 'World Facility Map',     href: '/facility-map',     icon: MapPin },
  { name: 'World Capacity by Fuel', href: '/capacity-by-fuel', icon: Globe },
  { name: 'Capacity by Country',    href: '/country-capacity', icon: Table },
  { name: 'Generation over Time',   href: '/country-compare',  icon: TrendingUpDown },
];

export default function TopNavbar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar
      expand="md"
      bg="light"
      data-bs-theme="light"
      expanded={expanded}
      onToggle={setExpanded}
      className="mb-3 px-3"
    >
      <Navbar.Brand as={Link} href="/facility-map" className="d-flex align-items-center gap-2">
        <Zap size={18} />
        <span className="fw-bold">World Power Tracker</span>
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="main-nav" onClick={() => setExpanded(!expanded)} />

      <Navbar.Collapse id="main-nav">
        <Nav className="ms-auto">
          {links.map(({ name, href, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Nav.Link
                key={name}
                as={Link}
                href={href}
                active={isActive}
                onClick={() => setExpanded(false)}
                className="d-flex align-items-center gap-2"
              >
                <Icon size={15} strokeWidth={2} />
                {name}
              </Nav.Link>
            );
          })}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

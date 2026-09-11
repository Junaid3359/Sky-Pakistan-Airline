import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { ArrowUpRight, Plane, Facebook, Instagram, Linkedin, Menu, X } from 'lucide-react';
import { useState } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchFlights from './pages/SearchFlights';
import FlightResults from './pages/FlightResults';
import BookFlight from './pages/BookFlight';
import ManageBooking from './pages/ManageBooking';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div className="page-shell">
      <header className="site-header">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link to="/" className="display-font flex items-center gap-3 text-xl font-extrabold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7b955] text-[#102b44]"><Plane size={20} /></span>
            Sky<span className="text-[#f7b955]">Pakistan</span>
          </Link>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button>
          <nav className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 top-full w-full flex-col gap-4 bg-[#102b44] px-6 py-5 md:static md:flex md:w-auto md:flex-row md:items-center md:gap-7 md:bg-transparent md:p-0`}>
            <Link className="nav-link" to="/search">Book a flight</Link>
            <Link className="nav-link" to="/manage">Manage booking</Link>
            <Link className="nav-link" to="/search">Flight status</Link>
            <Link className="nav-link" to="/login">Login</Link>
            <Link to="/register" className="flex items-center gap-2 rounded-full bg-[#f7b955] px-5 py-2.5 font-bold text-[#102b44]">Join SkyPakistan <ArrowUpRight size={16} /></Link>
          </nav>
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<SearchFlights />} />
          <Route path="/flights" element={<FlightResults />} />
          <Route path="/book/:id" element={<BookFlight />} />
          <Route path="/manage" element={<ManageBooking />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <footer className="bg-[#102b44] text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10">
          <div><Link to="/" className="display-font text-2xl font-extrabold">Sky<span className="text-[#f7b955]">Pakistan</span></Link><p className="mt-4 max-w-xs leading-7 text-white/65">A new way to see the world, with warm Pakistani hospitality in every mile.</p><div className="mt-6 flex gap-3"><span className="rounded-full border border-white/20 p-2"><Facebook size={17} /></span><span className="rounded-full border border-white/20 p-2"><Instagram size={17} /></span><span className="rounded-full border border-white/20 p-2"><Linkedin size={17} /></span></div></div>
          <div><h3 className="font-bold">Explore</h3><div className="mt-4 space-y-3 text-white/65"><Link className="block hover:text-[#f7b955]" to="/search">Book a flight</Link><Link className="block hover:text-[#f7b955]" to="/manage">Manage booking</Link><Link className="block hover:text-[#f7b955]" to="/search">Destinations</Link></div></div>
          <div><h3 className="font-bold">Travel with us</h3><div className="mt-4 space-y-3 text-white/65"><a className="block" href="#offers">Flight deals</a><a className="block" href="#destinations">Popular routes</a><Link className="block" to="/register">SkyPakistan Club</Link></div></div>
          <div><h3 className="font-bold">Need help?</h3><p className="mt-4 text-white/65">Our care team is here for your journey.</p><a className="mt-4 inline-block font-bold text-[#f7b955]" href="mailto:care@skypakistan.test">care@skypakistan.test</a></div>
        </div>
        <div className="border-t border-white/10 px-6 py-5 text-center text-sm text-white/45">© 2026 SkyPakistan Airways · Privacy · Terms · Accessibility</div>
      </footer>
    </div>
  );
}

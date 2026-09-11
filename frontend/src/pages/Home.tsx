import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, MapPin, Search, ShieldCheck, Sparkles } from 'lucide-react';
import { formatAirport, getAirport } from '../data/airports';

const destinations = [
  { city: 'Istanbul', country: 'Türkiye', code: 'IST', price: 'PKR 86,900', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=900&q=85' },
  { city: 'Dubai', country: 'United Arab Emirates', code: 'DXB', price: 'PKR 74,500', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=85' },
  { city: 'London', country: 'United Kingdom', code: 'LHR', price: 'PKR 196,800', image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=900&q=85' },
  { city: 'Kuala Lumpur', country: 'Malaysia', code: 'KUL', price: 'PKR 119,900', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?auto=format&fit=crop&w=900&q=85' },
  { city: 'Toronto', country: 'Canada', code: 'YYZ', price: 'PKR 238,400', image: 'https://images.unsplash.com/photo-1517935706615-2717063c2225?auto=format&fit=crop&w=900&q=85' },
  { city: 'Maldives', country: 'Maldives', code: 'MLE', price: 'PKR 92,600', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=85' }
];

const offers = [
  { type: 'RETURN', route: 'Lahore → Dubai', dates: '15 Sep — 22 Sep 2026', price: 'PKR 74,500', accent: 'from-[#e8b86c] to-[#f6d8a0]' },
  { type: 'RETURN', route: 'Islamabad → Istanbul', dates: '02 Oct — 09 Oct 2026', price: 'PKR 86,900', accent: 'from-[#7c9b9d] to-[#d2e0da]' },
  { type: 'ONE WAY', route: 'Karachi → Kuala Lumpur', dates: '18 Nov 2026', price: 'PKR 119,900', accent: 'from-[#c9896b] to-[#f1c6a5]' }
];

export default function Home() {
      return (
        <div>
          <section className="relative flex min-h-[760px] items-center overflow-hidden text-white">
            <video className="hero-video" autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=2000&q=85">
              <source src="https://videos.pexels.com/video-files/853800/853800-hd_1920_1080_30fps.mp4" type="video/mp4" />
            </video>
            <div className="hero-shade" />
            <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-28 lg:px-10">
              <div className="max-w-2xl">
                <p className="section-kicker !text-[#f7b955]">Pakistan, connected to the world</p>
                <h1 className="hero-title display-font mt-5 text-6xl font-extrabold md:text-8xl">Go further.<br /><span className="text-[#f7b955]">Feel closer.</span></h1>
                <p className="mt-6 max-w-lg text-lg leading-8 text-white/80">Thoughtful journeys from Pakistan to the places that stay with you forever.</p>
              </div>
              <div className="flight-panel mt-12 max-w-5xl rounded-3xl border border-white/25 bg-white/95 p-3 text-[#102b44] md:p-5">
                <div className="flex flex-wrap gap-5 border-b border-[#dce3e8] px-3 pb-4 text-sm font-bold"><span className="border-b-2 border-[#c47230] pb-3 text-[#c47230]">Book a flight</span><Link to="/manage" className="text-[#708090]">Manage booking</Link><Link to="/search" className="text-[#708090]">Flight status</Link></div>
                <div className="grid gap-3 p-2 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#71808c]">From<input className="mt-2 w-full border-0 bg-[#f1f4f5] p-4 text-base font-bold outline-none" defaultValue={formatAirport('LHE')} placeholder="Airport or city" /></label>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#71808c]">To<input className="mt-2 w-full border-0 bg-[#f1f4f5] p-4 text-base font-bold outline-none" defaultValue={formatAirport('DXB')} placeholder="Airport or city" /></label>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#71808c]">Departure<input type="date" className="mt-2 w-full border-0 bg-[#f1f4f5] p-4 text-base font-bold outline-none" defaultValue="2026-09-15" /></label>
                  <Link to="/search" className="flex items-center justify-center gap-2 bg-[#c47230] px-7 py-4 font-bold text-white transition hover:bg-[#aa5f24]"><Search size={18} /> Search</Link>
                </div>
              </div>
            </div>
          </section>

          <section className="mx-auto max-w-7xl px-6 py-20 lg:px-10" id="destinations">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="section-kicker">Where will you go?</p><h2 className="display-font mt-3 text-4xl font-extrabold text-[#102b44] md:text-5xl">A world of stories</h2></div><Link to="/search" className="flex items-center gap-2 font-bold text-[#c47230]">View all destinations <ArrowRight size={18} /></Link></div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{destinations.map((place) => { const airport = getAirport(place.code); return <Link to={`/search?destination=${place.code}`} key={place.city} className="destination-card group"><img className="absolute inset-0 h-full w-full object-cover" alt={place.city} src={place.image} /><div className="absolute bottom-0 z-10 p-6 text-white"><p className="text-sm font-semibold text-white/75">{place.country} · {airport.code}</p><h3 className="display-font mt-1 text-3xl font-extrabold">{place.city}</h3><p className="mt-1 text-xs text-white/80">{airport.name}</p><p className="mt-3 text-sm">Economy from <strong>{place.price}</strong></p></div></Link>; })}</div>
          </section>

          <section className="bg-[#e8eef0]" id="offers"><div className="mx-auto max-w-7xl px-6 py-20 lg:px-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="section-kicker">Curated fares</p><h2 className="display-font mt-3 text-4xl font-extrabold text-[#102b44]">Tickets worth travelling for</h2></div><p className="max-w-sm leading-7 text-[#667784]">Flexible fares, generous hospitality and a little more room for the moments that matter.</p></div><div className="mt-10 grid gap-5 lg:grid-cols-3">{offers.map((offer) => <div className="ticket-card overflow-hidden rounded-2xl bg-white transition" key={offer.route}><div className={`h-2 bg-gradient-to-r ${offer.accent}`} /><div className="p-6"><div className="flex items-center justify-between text-xs font-extrabold tracking-widest text-[#c47230]"><span>{offer.type}</span><span>SKYPAKISTAN</span></div><div className="my-8 flex items-center gap-4"><div><p className="text-2xl font-extrabold text-[#102b44]">{offer.route.split(' → ')[0]}</p><p className="text-sm text-[#71808c]">Pakistan</p></div><div className="h-px flex-1 border-t border-dashed border-[#bcc8ce]" /><div className="text-right"><p className="text-2xl font-extrabold text-[#102b44]">{offer.route.split(' → ')[1]}</p><p className="text-sm text-[#71808c]">International</p></div></div><div className="flex items-end justify-between border-t border-[#e4eaed] pt-5"><div><p className="text-xs text-[#71808c]">{offer.dates}</p><p className="mt-1 text-xl font-extrabold text-[#c47230]">{offer.price}</p></div><Link to="/search" aria-label={`Book ${offer.route}`} className="rounded-full bg-[#102b44] p-3 text-white hover:bg-[#c47230]"><ChevronRight size={20} /></Link></div></div></div>)}</div></div></section>

          <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center lg:px-10"><div><p className="section-kicker">The SkyPakistan difference</p><h2 className="display-font mt-3 text-4xl font-extrabold leading-tight text-[#102b44] md:text-5xl">More than a flight.<br />A feeling you carry.</h2><p className="mt-6 max-w-lg text-lg leading-8 text-[#667784]">From the first welcome to the last view from your window, we make every part of your journey feel considered.</p><div className="mt-8 grid gap-5 sm:grid-cols-3"><div><ShieldCheck className="text-[#c47230]" /><p className="mt-3 font-bold text-[#102b44]">Travel assured</p></div><div><Sparkles className="text-[#c47230]" /><p className="mt-3 font-bold text-[#102b44]">Thoughtful service</p></div><div><MapPin className="text-[#c47230]" /><p className="mt-3 font-bold text-[#102b44]">More places</p></div></div></div><div className="relative overflow-hidden rounded-[28px]"><img className="h-[440px] w-full object-cover" src="https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=1200&q=85" alt="Airplane wing above clouds" /><div className="absolute bottom-6 left-6 rounded-xl bg-white/90 px-5 py-4"><p className="text-xs font-bold uppercase tracking-widest text-[#c47230]">Our promise</p><p className="mt-1 display-font font-extrabold text-[#102b44]">You arrive feeling good.</p></div></div></section>
        </div>
      );
}

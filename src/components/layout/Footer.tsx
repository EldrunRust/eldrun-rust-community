'use client'

import Link from 'next/link'
import { Github, MessageCircle, Twitter, Youtube, Heart, Twitch, Instagram } from 'lucide-react'
import { SERVER_INFO } from '@/data/serverData'

const SOCIAL_LINKS = [
  { icon: MessageCircle, href: SERVER_INFO.discord, label: 'Discord', color: 'hover:text-[#5865F2]' },
  { icon: Twitter, href: 'https://twitter.com/EldrunServer', label: 'Twitter', color: 'hover:text-[#1DA1F2]' },
  { icon: Youtube, href: 'https://youtube.com/@EldrunGaming', label: 'YouTube', color: 'hover:text-[#FF0000]' },
  { icon: Twitch, href: 'https://twitch.tv/EldrunServer', label: 'Twitch', color: 'hover:text-[#9146FF]' },
  { icon: Instagram, href: 'https://instagram.com/EldrunServer', label: 'Instagram', color: 'hover:text-[#E4405F]' },
]

// All links organized by category
const FOOTER_LINKS = {
  spielen: {
    title: 'Spielen',
    links: [
      { label: 'Server Status', href: '/heatmap' },
      { label: 'Features', href: '/features' },
      { label: 'Leaderboard', href: '/leaderboard' },
      { label: 'Achievements', href: '/achievements' },
      { label: 'Casino', href: '/casino' },
    ]
  },
  community: {
    title: 'Community',
    links: [
      { label: 'Forum', href: '/forum' },
      { label: 'Clans', href: '/clans' },
      { label: 'News', href: '/news' },
      { label: 'Gallery', href: '/gallery' },
      { label: 'Discord', href: SERVER_INFO.discord, external: true },
    ]
  },
  support: {
    title: 'Support',
    links: [
      { label: 'Shop', href: '/shop' },
      { label: 'Spenden', href: '/support' },
      { label: 'Vote', href: '/vote' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Kontakt', href: '/contact' },
    ]
  },
  info: {
    title: 'Information',
    links: [
      { label: 'Regeln', href: '/rules' },
      { label: 'Staff Team', href: '/staff' },
      { label: 'Changelog', href: '/changelog' },
      { label: 'Blacklist', href: '/blacklist' },
      { label: 'Ban Appeal', href: '/appeals' },
    ]
  },
  legal: {
    title: 'Rechtliches',
    links: [
      { label: 'AGB', href: '/terms' },
      { label: 'Datenschutz', href: '/privacy' },
      { label: 'Impressum', href: '/impressum' },
    ]
  },
}

export function Footer() {
  return (
    <footer id="site-footer" className="relative bg-metal-950 border-t border-metal-800">
      {/* Rust texture overlay */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-b from-rust-500/10 to-transparent pointer-events-none" />
      
      <div className="container-rust relative z-10">
        {/* Main Footer */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-8 lg:gap-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 via-rust-500 to-red-900 flex items-center justify-center rounded-xl">
                <span className="font-display font-black text-lg text-white">E</span>
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-white tracking-wider">
                  {SERVER_INFO.name}
                </h3>
                <p className="font-mono text-xs text-rust-400">{SERVER_INFO.tagline}</p>
              </div>
            </div>
            <p className="text-metal-400 text-sm mb-6 max-w-sm leading-relaxed">
              {SERVER_INFO.description}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2">
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={social.label}
                  className={`w-10 h-10 bg-metal-900 border border-metal-700 rounded-lg flex items-center justify-center text-metal-400 ${social.color} hover:border-metal-500 transition-all duration-300`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Spielen Links */}
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-sm mb-4">{FOOTER_LINKS.spielen.title}</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.spielen.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-metal-400 hover:text-rust-400 transition-colors duration-300 text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-sm mb-4">{FOOTER_LINKS.community.title}</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.community.links.map((link) => (
                <li key={link.label}>
                  {'external' in link && link.external ? (
                    <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-metal-400 hover:text-rust-400 transition-colors duration-300 text-sm">
                      {link.label} ↗
                    </a>
                  ) : (
                    <Link href={link.href} className="text-metal-400 hover:text-rust-400 transition-colors duration-300 text-sm">
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-sm mb-4">{FOOTER_LINKS.support.title}</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.support.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-metal-400 hover:text-rust-400 transition-colors duration-300 text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info Links */}
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-sm mb-4">{FOOTER_LINKS.info.title}</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.info.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-metal-400 hover:text-rust-400 transition-colors duration-300 text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-display font-bold text-white uppercase tracking-wider text-sm mb-4">{FOOTER_LINKS.legal.title}</h4>
            <ul className="space-y-2">
              {FOOTER_LINKS.legal.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-metal-400 hover:text-rust-400 transition-colors duration-300 text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Server Info Bar */}
        <div className="py-4 border-t border-metal-800 flex flex-wrap justify-center gap-6 text-sm font-mono text-metal-500">
          <span>IP: <span className="text-rust-400">{SERVER_INFO.ip}:{SERVER_INFO.port}</span></span>
          <span>Map: <span className="text-metal-300">{SERVER_INFO.mapSize}</span></span>
          <span>Team Limit: <span className="text-metal-300">{SERVER_INFO.teamLimit}</span></span>
          <span>Wipe: <span className="text-metal-300">{SERVER_INFO.wipeSchedule}</span></span>
        </div>

        {/* Copyright */}
        <div className="py-6 border-t border-metal-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-metal-500 text-sm">
            © {new Date().getFullYear()} {SERVER_INFO.name}. All rights reserved.
          </p>
          <p className="text-metal-600 text-sm flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-blood-500 fill-blood-500" /> for Eldrun | eldrun.lol
          </p>
        </div>
      </div>
    </footer>
  )
}

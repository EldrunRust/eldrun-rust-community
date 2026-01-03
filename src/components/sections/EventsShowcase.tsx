'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Skull, Zap, Ship, Plane, Flame } from 'lucide-react'

const EVENTS = [
  {
    id: 'ufo-invasion',
    title: 'Alien Invasion',
    description: 'Mysteriöse UFOs erscheinen über Eldrun. Verteidige deine Basis gegen außerirdische Bedrohungen!',
    image: '/images/events/ufo-invasion.png',
    icon: Zap,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-500/50',
    schedule: 'Jeden Freitag 20:00'
  },
  {
    id: 'meteor-event',
    title: 'Meteor Shower',
    description: 'Feurige Meteore stürzen vom Himmel! Sammle seltene Ressourcen aus den Einschlagkratern.',
    image: '/images/events/meteor-event.png',
    icon: Flame,
    color: 'from-orange-500/20 to-red-500/20',
    borderColor: 'border-orange-500/50',
    schedule: 'Zufällig'
  },
  {
    id: 'hell-invasion',
    title: 'Höllentor',
    description: 'Das Tor zur Unterwelt öffnet sich. Kämpfe gegen Dämonenhorden und verdiene legendäre Beute!',
    image: '/images/events/hell-invasion.png',
    icon: Skull,
    color: 'from-red-500/20 to-orange-500/20',
    borderColor: 'border-red-500/50',
    schedule: 'Samstag 22:00'
  },
  {
    id: 'bradley-event',
    title: 'Bradley APC',
    description: 'Ein schwer gepanzerter Bradley patrouilliert das Gebiet. Zerstöre ihn für militärische Ausrüstung!',
    image: '/images/events/bradley-apc.png',
    icon: Plane,
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-500/50',
    schedule: 'Alle 2 Stunden'
  },
  {
    id: 'cargo-ship',
    title: 'Cargo Ship',
    description: 'Ein riesiges Frachtschiff nähert sich der Küste. Plündere die Container bevor es wieder ablegt!',
    image: '/images/events/cargo-ship.png',
    icon: Ship,
    color: 'from-amber-500/20 to-yellow-500/20',
    borderColor: 'border-amber-500/50',
    schedule: 'Alle 3 Stunden'
  },
  {
    id: 'monster-horde',
    title: 'Monster Horde',
    description: 'Eine Welle von Monstern überrennt das Land. Überlebe die Nacht und erhalte epische Belohnungen!',
    image: '/images/events/monster-horde.png',
    icon: Skull,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-500/50',
    schedule: 'Jede Nacht'
  }
]

export default function EventsShowcase() {
  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-red-900/5 to-black/0" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-8 h-8 text-red-500" />
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-amber-400 bg-clip-text text-transparent">
              Dynamische Events
            </h2>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Erlebe einzigartige Server-Events mit epischen Belohnungen und unvergesslichen Schlachten
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EVENTS.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href="/challenges">
                <div className={`group relative rounded-xl overflow-hidden border ${event.borderColor} bg-gradient-to-br ${event.color} backdrop-blur-sm hover:scale-[1.02] transition-all duration-300`}>
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                    
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-1 flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span className="text-xs text-amber-300">{event.schedule}</span>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${event.color} border ${event.borderColor}`}>
                        <event.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
                        {event.title}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

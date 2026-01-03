import { HeroSection } from '@/components/sections/HeroSection'
import { ServerStatus } from '@/components/sections/ServerStatus'
import { HomePortalsSection } from '@/components/sections/HomePortalsSection'
import { FeaturesSection } from '@/components/sections/FeaturesSection'
import { ClassesShowcase } from '@/components/sections/ClassesShowcase'
import { GameFeaturesGrid } from '@/components/sections/GameFeaturesGrid'
import EventsShowcase from '@/components/sections/EventsShowcase'
import WorldMapSection from '@/components/sections/WorldMapSection'
import BossShowcase from '@/components/sections/BossShowcase'
import { InfiniteScrollContainer } from '@/components/infinite/InfiniteScrollContainer'
import { TelemetryPulsePanel } from '@/components/telemetry/TelemetryPulsePanel'

export default function Home() {
  return (
    <>
      <HeroSection />
      <HomePortalsSection />
      <ServerStatus />
      <section className="py-16 bg-metal-950">
        <div className="container-rust">
          <TelemetryPulsePanel />
        </div>
      </section>
      <FeaturesSection />
      <ClassesShowcase />
      <GameFeaturesGrid />
      <EventsShowcase />
      <WorldMapSection />
      <BossShowcase />
      <InfiniteScrollContainer />
    </>
  )
}

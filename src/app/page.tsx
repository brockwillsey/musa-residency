import { Hero } from '@/components/hero';
import { FeaturedHomes } from '@/components/featured-homes';
import { HowItWorks } from '@/components/how-it-works';

export default function HomePage() {
  return (
    <div className="space-y-16 pb-16">
      <Hero />
      <FeaturedHomes />
      <HowItWorks />
    </div>
  );
}
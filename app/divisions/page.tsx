import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/ui/Hero';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { FaShoppingBag, FaSeedling, FaLaptopCode, FaShippingFast, FaBriefcase, FaPumpSoap } from 'react-icons/fa';
import dbConnect from '@/lib/db';
import DivisionModel from '@/lib/models/Division';

const iconMap: Record<string, any> = {
  'fashion-beauty': FaShoppingBag,
  'agriculture-food': FaSeedling,
  'technology': FaLaptopCode,
  'trade-logistics': FaShippingFast,
  'business-consulting': FaBriefcase,
  'fragrance': FaPumpSoap,
};

async function getDivisions() {
  try {
    await dbConnect();
    const divisions = await DivisionModel.find().sort({ order: 1 }).lean();
    return JSON.parse(JSON.stringify(divisions));
  } catch (error) {
    console.error('Error fetching divisions:', error);
    return [];
  }
}

export default async function DivisionsPage() {
  const dbDivisions = await getDivisions();

  const displayDivisions = dbDivisions.length > 0 ? dbDivisions.map((d: any) => ({
    id: d._id,
    name: d.name,
    slug: d.slug,
    description: d.description,
    longDescription: d.description, // Fallback
    features: [], // Fallback
    Icon: iconMap[d.slug] || FaBriefcase
  })) : [
    { id: 1, name: 'Fashion & Beauty', slug: 'fashion-beauty', Icon: FaShoppingBag, description: 'Premium fashion and beauty products...', longDescription: '...', features: ['Designer bags', 'Beauty'] },
  ];
  return (
    <>
      <Header />
      
      <main>
        {/* Hero Section */}
        <Hero
          badge="Our Divisions"
          title="Diverse Expertise, Unified Excellence"
          description="Explore our core divisions, each dedicated to delivering exceptional value and innovation in their respective industries."
          centered
        />
        
        {/* Divisions Grid */}
        <Section background="gradient-soft" padding="lg" withTexture>
          <div className="container">
            <div className="space-y-16">
              {displayDivisions.map((division: any, index: number) => {
                const Icon = division.Icon;
                return (
                  <div
                    key={division.id}
                    className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${
                      index % 2 === 1 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    <div className={index % 2 === 1 ? 'md:order-2' : ''}>
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-rare-accent/30 to-rare-primary/20 rounded-full mb-4 shadow-lg">
                        <Icon className="text-3xl text-rare-primary" />
                      </div>
                      <h2 className="font-heading text-3xl md:text-4xl font-normal text-rare-primary mb-4">
                        {division.name}
                      </h2>
                      <p className="font-body text-base md:text-lg text-rare-text-light leading-relaxed mb-6">
                        {division.longDescription}
                      </p>
                      <div className="mb-6">
                        <h3 className="font-heading text-xl font-normal text-rare-primary mb-3">
                          Key Services:
                        </h3>
                        <ul className="space-y-2">
                          {division.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 font-body text-sm text-rare-text-light">
                              <span className="text-rare-primary mt-1">✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <Button href={`/divisions/${division.slug}`} variant="primary">
                        Learn More
                      </Button>
                    </div>

                    <div className={index % 2 === 1 ? 'md:order-1' : ''}>
                      <Card padding="none" className="aspect-square bg-gradient-to-br from-rare-accent/20 to-rare-primary/10 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-rare-primary/5"></div>
                        <Icon className="text-9xl text-rare-primary opacity-20 relative z-10" />
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>
        
        {/* CTA Section */}
        <Section background="gradient-blue" padding="lg">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-heading text-3xl md:text-5xl font-normal mb-6">
                Interested in Our Services?
              </h2>
              <p className="font-body text-base md:text-lg mb-8 text-white/90">
                Contact us to learn more about how our divisions can help your business grow
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button href="/contact" variant="primary" size="lg" className="bg-rare-accent text-rare-primary hover:bg-rare-accent/90">
                  Get in Touch
                </Button>
                <Button href="/products" variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  View Products
                </Button>
              </div>
            </div>
          </div>
        </Section>
      </main>
      
      <Footer />
    </>
  );
}
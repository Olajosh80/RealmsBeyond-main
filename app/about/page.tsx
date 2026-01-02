import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/ui/Hero';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { FaBullseye, FaEye, FaHeart, FaUsers, FaAward, FaGlobe } from 'react-icons/fa';

const values = [
  {
    icon: FaBullseye,
    title: 'Excellence',
    description: 'We strive for excellence in everything we do, setting the highest standards across all our divisions.',
  },
  {
    icon: FaHeart,
    title: 'Integrity',
    description: 'We conduct business with honesty, transparency, and ethical practices at every level.',
  },
  {
    icon: FaUsers,
    title: 'Collaboration',
    description: 'We believe in the power of teamwork and partnerships to achieve extraordinary results.',
  },
  {
    icon: FaAward,
    title: 'Innovation',
    description: 'We embrace innovation and continuously seek new ways to improve and grow.',
  },
  {
    icon: FaGlobe,
    title: 'Global Impact',
    description: 'We aim to make a positive impact on communities and industries worldwide.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />

      <main>
        {/* Hero Section */}
        <Hero
          badge="About Us"
          title="Building Realms of Excellence"
          description="Beyond Realms LTD is a multi-sector conglomerate committed to transcending boundaries and creating value across diverse industries."
          centered
        />

        {/* Mission & Vision Section */}
        <Section background="gradient-beige" padding="lg" withTexture>
          <div className="container">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white rounded-full shadow-lg">
                    <FaBullseye className="h-8 w-8 text-rare-primary" />
                  </div>
                  <h2 className="font-heading text-3xl md:text-4xl font-normal text-rare-primary">
                    Our Mission
                  </h2>
                </div>
                <p className="font-body text-base md:text-lg text-rare-text-light leading-relaxed">
                  To transcend traditional business boundaries by delivering exceptional products and services
                  across multiple sectors. We are committed to innovation, quality, and sustainable growth,
                  creating value for our stakeholders while making a positive impact on the communities we serve.
                </p>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white rounded-full shadow-lg">
                    <FaEye className="h-8 w-8 text-rare-primary" />
                  </div>
                  <h2 className="font-heading text-3xl md:text-4xl font-normal text-rare-primary">
                    Our Vision
                  </h2>
                </div>
                <p className="font-body text-base md:text-lg text-rare-text-light leading-relaxed">
                  To be a globally recognized conglomerate that sets the standard for excellence across
                  fashion, agriculture, technology, trade, and business consulting. We envision a future
                  where our diverse portfolio creates synergies that drive innovation and sustainable development.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Company Story Section */}
        <Section background="white" padding="lg">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-heading text-3xl md:text-5xl font-normal text-rare-primary mb-8 text-center">
                Our Story
              </h2>
              <div className="space-y-6 font-body text-base md:text-lg text-rare-text-light leading-relaxed">
                <p>
                  Beyond Realms LTD was founded with a bold vision: to create a conglomerate that transcends
                  traditional industry boundaries and builds realms of excellence across multiple sectors.
                  What started as a dream has evolved into a dynamic organization operating in fashion,
                  agriculture, technology, trade, and business consulting.
                </p>
                <p>
                  Our journey has been marked by strategic growth, innovative thinking, and an unwavering
                  commitment to quality. We've built strong partnerships, invested in cutting-edge technology,
                  and assembled teams of talented professionals who share our vision for excellence.
                </p>
                <p>
                  Today, Beyond Realms LTD stands as a testament to what's possible when passion meets purpose.
                  We continue to expand our reach, explore new opportunities, and create value for our
                  stakeholders while staying true to our core values and mission.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Core Values Section */}
        <Section background="alt" padding="lg">
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl md:text-5xl font-normal text-rare-primary mb-4">
                Our Core Values
              </h2>
              <p className="font-body text-base md:text-lg text-rare-text-light max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} padding="lg">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-rare-primary-light rounded-full mb-4">
                        <Icon className="h-8 w-8 text-rare-primary" />
                      </div>
                      <h3 className="font-heading text-xl md:text-2xl font-normal text-rare-primary mb-3">
                        {value.title}
                      </h3>
                      <p className="font-body text-sm text-rare-text-light">
                        {value.description}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Team Section */}
        <Section background="default" padding="lg">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="font-heading text-3xl md:text-5xl font-normal text-rare-primary mb-6">
                Our Team
              </h2>
              <p className="font-body text-base md:text-lg text-rare-text-light leading-relaxed mb-8">
                Behind Beyond Realms LTD is a team of dedicated professionals who bring expertise,
                passion, and innovation to every project. Our diverse team spans multiple disciplines
                and geographies, united by a common goal: to build realms of excellence.
              </p>
              <p className="font-body text-base md:text-lg text-rare-text-light leading-relaxed">
                From fashion designers to agricultural experts, technology innovators to logistics specialists,
                our team represents the best in their respective fields. Together, we're creating a future
                where boundaries are transcended and possibilities are limitless.
              </p>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </>
  );
}


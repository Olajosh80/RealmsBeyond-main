import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/ui/Hero';
import { Section } from '@/components/ui/Section';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import dbConnect from '@/lib/db';
import DivisionModel from '@/lib/models/Division';
import ProductModel from '@/lib/models/Product';
import { notFound } from 'next/navigation';
import Link from 'next/link';

async function getDivisionData(slug: string) {
  try {
    await dbConnect();
    const division = await DivisionModel.findOne({ slug }).lean();
    if (!division) return null;

    const products = await ProductModel.find({ division_id: division._id, in_stock: true }).limit(6).lean();
    
    return {
      division: JSON.parse(JSON.stringify(division)),
      products: JSON.parse(JSON.stringify(products))
    };
  } catch (error) {
    console.error('Error fetching division data:', error);
    return null;
  }
}

export default async function DivisionDetailPage({ params }: { params: { slug: string } }) {
  const data = await getDivisionData(params.slug);

  if (!data) {
    notFound();
  }

  const { division, products } = data;

  return (
    <>
      <Header />
      
      <main>
        <Hero
          badge="Our Divisions"
          title={division.name}
          description={division.description}
          centered
        />

        <Section background="white" padding="lg">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="font-heading text-3xl md:text-4xl font-normal text-rare-primary mb-6">
                Featured Products in {division.name}
              </h2>
              <p className="font-body text-lg text-rare-text-light">
                Discover our curated selection of products and services within this division.
              </p>
            </div>

            {products.length === 0 ? (
              <div className="text-center py-12">
                <p className="font-body text-rare-text-light">No products found in this division yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((product: any) => (
                  <Card key={product._id} hover padding="none">
                    <Link href={`/products/${product.slug}`}>
                      <div className="aspect-square bg-gray-100 overflow-hidden">
                        <img
                          src={product.images?.[0] || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="font-heading text-xl font-normal text-rare-primary mb-2">{product.name}</h3>
                        <p className="font-body text-sm text-rare-text-light mb-4 line-clamp-2">{product.description}</p>
                        <span className="font-semibold text-rare-primary">${product.price.toFixed(2)}</span>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Button href="/products" variant="outline">
                View All Products
              </Button>
            </div>
          </div>
        </Section>
      </main>

      <Footer />
    </>
  );
}

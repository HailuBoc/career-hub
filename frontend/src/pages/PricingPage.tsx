import PageTransition from '@/components/shared/PageTransition'
import PricingSection from '@/components/home/PricingSection'
import FAQSection from '@/components/home/FAQSection'
import NewsletterSection from '@/components/home/NewsletterSection'

export default function PricingPage() {
  return (
    <PageTransition>
      <div className="pt-20">
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 py-14 text-center text-white">
          <h1 className="text-4xl font-extrabold mb-3">Simple Pricing</h1>
          <p className="text-slate-400">No hidden fees. Cancel anytime.</p>
        </div>
        <PricingSection />
        <FAQSection />
        <NewsletterSection />
      </div>
    </PageTransition>
  )
}

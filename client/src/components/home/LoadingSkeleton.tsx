import { Skeleton } from "@/components/ui/skeleton";

export function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Hero Section Skeleton */}
      <section className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Skeleton className="h-16 w-3/4 mx-auto mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl mx-auto mb-4" />
            <Skeleton className="h-6 w-5/6 max-w-2xl mx-auto mb-10" />
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Skeleton className="h-12 w-40 rounded-full mx-auto sm:mx-0" />
              <Skeleton className="h-12 w-40 rounded-full mx-auto sm:mx-0" />
            </div>
          </div>
        </div>
      </section>
      
      {/* Stats Section Skeleton */}
      <section className="py-16 bg-[#1E293B]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-[#0F172A] p-6 rounded-xl">
                <Skeleton className="h-10 w-10 rounded-full mb-4" />
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features Section Skeleton */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-full max-w-xl mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-[#1E293B] p-6 rounded-xl">
                <Skeleton className="h-10 w-10 rounded-full mb-4" />
                <Skeleton className="h-6 w-48 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Testimonials Section Skeleton */}
      <section className="py-20 bg-[#1E293B]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-5 w-full max-w-xl mx-auto" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-[#0F172A] p-6 rounded-xl">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-6" />
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section Skeleton */}
      <section className="py-20 bg-[#0F172A]">
        <div className="container mx-auto px-4">
          <div className="bg-[#1E293B] rounded-2xl p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
              <Skeleton className="h-5 w-full max-w-xl mx-auto mb-8" />
              <Skeleton className="h-12 w-40 rounded-full mx-auto" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 
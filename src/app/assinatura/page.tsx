import { Suspense } from 'react';
import AssinaturaPageContent from './page-content';

export default function AssinaturaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      }
    >
      <AssinaturaPageContent />
    </Suspense>
  );
}


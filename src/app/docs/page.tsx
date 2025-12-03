'use client';

import dynamic from 'next/dynamic';
import 'swagger-ui-react/swagger-ui.css';

// Dynamically import SwaggerUI to avoid SSR issues
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold text-neutral-800 mb-4">
          Guiltless Cakes API Documentation
        </h1>
        <p className="text-neutral-600 mb-8">
          Interactive API documentation powered by OpenAPI 3.0
        </p>
        <SwaggerUI url="/api/docs" />
      </div>
    </div>
  );
}

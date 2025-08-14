"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dynamic imports for heavy form components
const MediaContentComplaintForm = dynamic(() => import("./MediaContentComplaintForm").then(mod => ({ default: mod.MediaContentComplaintForm })), {
  ssr: false, // Forms don't need SSR
  loading: () => <FormLoadingSkeleton title="Formulaire de plainte" />,
});

const MediaContentReportForm = dynamic(() => import("./MediaContentReportForm").then(mod => ({ default: mod.MediaContentReportForm })), {
  ssr: false,
  loading: () => <FormLoadingSkeleton title="Formulaire de signalement" />,
});

const EnhancedFileUploadV3 = dynamic(() => import("./FormFields/EnhancedFileUploadV3"), {
  ssr: false,
  loading: () => <FileUploadLoadingSkeleton />,
});

// Loading skeletons for better UX
function FormLoadingSkeleton({ title }: { title: string }) {
  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-64" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Form fields skeleton */}
        {[...Array(8)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
        
        {/* File upload section */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-32 w-full rounded-lg border-2 border-dashed" />
        </div>
        
        {/* Submit button */}
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  );
}

function FileUploadLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-4 w-32" />
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-12 w-12 rounded-full mx-auto" />
          <Skeleton className="h-4 w-48 mx-auto" />
          <Skeleton className="h-3 w-64 mx-auto" />
          <Skeleton className="h-9 w-32 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Export dynamic components with proper typing
export interface DynamicMediaFormProps {
  [key: string]: any;
}

// Specific prop interface for file upload
export interface DynamicFileUploadProps extends DynamicMediaFormProps {
  onChange?: (files: File[]) => void;
}

export function DynamicMediaContentComplaintForm(props: DynamicMediaFormProps) {
  return (
    <Suspense fallback={<FormLoadingSkeleton title="Formulaire de plainte" />}>
      <MediaContentComplaintForm {...props} />
    </Suspense>
  );
}

export function DynamicMediaContentReportForm(props: DynamicMediaFormProps) {
  return (
    <Suspense fallback={<FormLoadingSkeleton title="Formulaire de signalement" />}>
      <MediaContentReportForm {...props} />
    </Suspense>
  );
}

export function DynamicEnhancedFileUpload(props: DynamicFileUploadProps) {
  return (
    <Suspense fallback={<FileUploadLoadingSkeleton />}>
      <EnhancedFileUploadV3 {...props} />
    </Suspense>
  );
}

// Note: Static exports would require direct imports
// These are commented out because the components are dynamically imported above
// export { MediaContentComplaintForm } from "./MediaContentComplaintForm";
// export { MediaContentReportForm } from "./MediaContentReportForm";
// export { default as EnhancedFileUploadV3 } from "./FormFields/EnhancedFileUploadV3";
import { redirect } from 'next/navigation';

export default function RootPage() {
  // Redirect to the default locale (French)
  // Since we use localePrefix: 'as-needed', French doesn't need a prefix
  // This redirects to the home page which will be handled by [locale]/page.tsx
  redirect('/fr');
}
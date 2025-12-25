import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Idea Bucket AI',
  description: 'AI-powered idea bucket for inventors',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation */}
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <Link href="/" className="flex items-center px-2 text-xl font-bold text-blue-600">
                    💡 Idea Bucket AI
                  </Link>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    <Link
                      href="/ideas"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      My Ideas
                    </Link>
                    <Link
                      href="/clusters"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                    >
                      Concept Clusters
                    </Link>
                  </div>
                </div>
                <div className="flex items-center">
                  <Link
                    href="/ideas/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    + Add Idea
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main>{children}</main>

          {/* Footer */}
          <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <p className="text-center text-sm text-gray-500">
                Idea Bucket AI - Part of Prototype Cafe Platform
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

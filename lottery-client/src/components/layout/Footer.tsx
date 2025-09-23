import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center space-x-8 text-sm">
          <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
            CONTACT
          </Link>
          <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">
            TERMS
          </Link>
          <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
            PRIVACY
          </Link>
          <Link href="/licensing" className="text-gray-400 hover:text-white transition-colors">
            LICENSING
          </Link>
        </div>
        <div className="mt-4 text-center text-gray-500 text-sm">
          © 2024 The Crypto Lottery. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
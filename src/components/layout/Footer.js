import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <p className="text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} Product Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
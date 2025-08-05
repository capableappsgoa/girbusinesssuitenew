import React from 'react';
import { Building2 } from 'lucide-react';

const CompanyLogo = ({ company, size = 'md', showName = false, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-8 w-8'
  };



  if (!company) {
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center ${className}`}>
        <Building2 className={`${iconSizes[size]} text-white`} />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {company.logoUrl ? (
        <div className={`${sizeClasses[size]} rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center bg-white`}>
          <img 
            src={company.logoUrl} 
            alt={company.logoAltText || company.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center`} style={{display: 'none'}}>
            <Building2 className={`${iconSizes[size]} text-white`} />
          </div>
        </div>
      ) : (
        <div className={`${sizeClasses[size]} bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center`}>
          <Building2 className={`${iconSizes[size]} text-white`} />
        </div>
      )}
      
      {showName && (
        <div>
          <h3 className="font-semibold text-gray-900">{company.name}</h3>
          {company.industry && (
            <p className="text-sm text-gray-500">{company.industry}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanyLogo; 
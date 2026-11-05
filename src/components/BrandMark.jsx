import React from 'react';

// The wordmark or neighbouring accessible label supplies the brand name.
export default function BrandMark({ className = '' }) {
 return <img className={`brand-mark ${className}`} src="/rivetara-mark.svg" width="48" height="48" alt="" aria-hidden="true"/>;
}

import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const LazyImage = ({ src, alt, className, ...props }) => {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      className={className}
      effect="blur"
      placeholderSrc="/placeholder-image.png" // Add a placeholder image
      threshold={100}
      {...props}
    />
  );
};

export default LazyImage;
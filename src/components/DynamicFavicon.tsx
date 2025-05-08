import React, { useEffect } from 'react';
import { Producer } from '@/types/api';

interface Props {
  producer: Producer | null;
}

const DynamicFavicon: React.FC<Props> = ({ producer }) => {
  useEffect(() => {
    const updateFavicon = () => {
      const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (link) {
        link.remove();
      }

      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.type = 'image/svg+xml';

      if (producer?.logo) {
        newLink.href = producer.logo;
      } else {
        newLink.href = '/src/favicon.svg';
      }

      document.head.appendChild(newLink);
    };

    updateFavicon();
  }, [producer?.logo]);

  return null;
};

export default DynamicFavicon;
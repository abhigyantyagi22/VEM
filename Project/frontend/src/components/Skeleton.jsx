import React from 'react';

const Skeleton = ({ width = '100%', height = '16px', borderRadius = '8px', style = {} }) => (
  <div className="vem-skeleton" style={{ width, height, borderRadius, flexShrink: 0, ...style }} />
);

export default Skeleton;

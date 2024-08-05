import React, { useEffect, useRef } from 'react';

interface LineProps{
	id: number;
	startX: number;
	startY: number;
	endX: number;
	endY: number;
}

const Line: React.FC<LineProps> = ({ startX, startY, endX, endY }) => {
  return (
    <line
      x1={startX}
      y1={startY}
      x2={endX}
      y2={endY}
      stroke="black"
      strokeWidth="2"
    />
  );
};

export default Line;
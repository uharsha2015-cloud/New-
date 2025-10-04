import React, { useRef, useState, useLayoutEffect } from 'react';

interface InfoPopupProps {
  x: number;
  y: number;
  data: string | null;
  locationName: string | null;
  loading: boolean;
  layerName: string;
  layerIcon?: React.ReactNode;
  error: string | null;
  onClose: () => void;
}

const InfoPopup: React.FC<InfoPopupProps> = ({
  x,
  y,
  data,
  locationName,
  loading,
  layerName,
  layerIcon,
  error,
  onClose,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: y, left: x });

  useLayoutEffect(() => {
    if (popupRef.current) {
        const { innerWidth, innerHeight } = window;
        const { clientWidth, clientHeight } = popupRef.current;
        const offset = 24; // 1.5rem

        let newLeft = x + offset;
        let newTop = y + offset;

        if (newLeft + clientWidth > innerWidth) {
            newLeft = x - clientWidth - offset;
        }
        if (newTop + clientHeight > innerHeight) {
            newTop = y - clientHeight - offset;
        }

        setPosition({ top: newTop, left: newLeft });
    }
  }, [x, y, data, loading, error]);

  return (
    <div
      ref={popupRef}
      className="fixed bg-[#1e293b] bg-opacity-90 backdrop-blur-sm rounded-lg shadow-2xl p-4 w-80 text-white border border-gray-700 animate-fade-in z-30"
      style={{ top: position.top, left: position.left, opacity: position.top === y ? 0 : 1 }} // Hide until positioned
    >
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-700">
        <div className="flex items-center">
            {layerIcon && <div className="text-blue-400">{layerIcon}</div>}
            <h3 className="font-bold text-lg">{`${layerName} Data`}</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none">&times;</button>
      </div>

      <div className="text-sm">
        <p className="font-semibold text-gray-300 mb-2">
          Location: <span className="text-white font-normal">{locationName || 'Unknown'}</span>
        </p>
        
        {loading && (
            <div className="flex items-center justify-center p-4">
                <div className="w-6 h-6 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="ml-3">Fetching NASA data...</p>
            </div>
        )}
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-300 p-3 rounded-md">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        {data && !loading && !error && (
          <div className="bg-black bg-opacity-20 p-3 rounded-md">
            <div className="space-y-2 whitespace-pre-wrap">
              {data.split('\n').map((line, index) => (
                  <p key={index}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoPopup;
import React, { useEffect } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Card } from './ui/card';

interface ParticipantDetails {
  id: string;
  name: string;
  studentIndex: string;
  email: string;
}

interface AttendancePopupProps {
  participant: ParticipantDetails;
  onClose?: () => void;
}

const AttendancePopup: React.FC<AttendancePopupProps> = ({ participant, onClose }) => {
  useEffect(() => {
    // Create a fixed position container for the popup
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    container.style.zIndex = '1000';
    container.style.animation = 'fadeIn 0.3s ease-out';
    
    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -40%); }
        to { opacity: 1; transform: translate(-50%, -50%); }
      }
      @keyframes fadeOut {
        from { opacity: 1; transform: translate(-50%, -50%); }
        to { opacity: 0; transform: translate(-50%, -40%); }
      }
    `;
    document.head.appendChild(style);

    const content = (
      <Card className="w-96 p-6 bg-white/95 backdrop-blur shadow-xl rounded-lg border border-green-200">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-green-600">Welcome!</h3>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center animate-bounce">
              <svg 
                className="h-6 w-6 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-2xl font-medium text-gray-900">{participant.name}</p>
            <p className="text-gray-600 font-medium">ID: {participant.studentIndex}</p>
            <p className="text-sm text-gray-500">{participant.email}</p>
          </div>
          
          <div className="pt-2">
            <p className="text-green-600 font-medium text-center bg-green-50 py-2 rounded-md">
              ✓ Attendance marked successfully!
            </p>
          </div>
        </div>
      </Card>
    );

    // Render the popup
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    root.render(content);

    // Auto-dismiss after 2 seconds
    const timer = setTimeout(() => {
      container.style.animation = 'fadeOut 0.3s ease-in forwards';
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(container);
        document.head.removeChild(style);
        if (onClose) onClose();
      }, 300);
    }, 2000);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (document.body.contains(container)) {
        root.unmount();
        document.body.removeChild(container);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [participant, onClose]);

  return null;
};

export default AttendancePopup;
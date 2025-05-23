import React, { useState, useEffect, useRef }  from 'react';
import VibeDoku from './pages/vibedoku.jsx';

const App = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const Tab = {
    PROFILE: 'Profile',
    BLOG: 'Blog',
    PROJECTS: 'Projects',
    CONTACT: 'Contact',
  };

  const tabs = [Tab.PROFILE, Tab.BLOG, Tab.PROJECTS, Tab.CONTACT];

  return (
    <div className="w-full bg-gray-900 shadow-md">
      <div className="flex justify-center space-x-8 p-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-lg text-white font-medium pb-2 border-b-2 transition-colors duration-200 ${
              activeTab === tab
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent hover:text-blue-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 text-center">
        {activeTab === Tab.PROFILE && <p>🏠 Welcome to Vibedoku!</p>}
        {activeTab === Tab.BLOG && <div> <VibeDoku /> </div>}
        {activeTab === Tab.PROJECTS && <p>🏆 Top scores will show here.</p>}
        {activeTab === Tab.CONTACT && <p>⚙️ Customize your experience.</p>}
      </div>
    </div>
  );
};

export default App
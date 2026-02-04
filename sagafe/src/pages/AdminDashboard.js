import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdmin } from '../lib/auth';
import './AdminDashboard.css';
import UserManagement from './admin/UserManagement';
import EventManagement from './admin/EventManagement';
import EventRegistrations from './admin/EventRegistrations';
import BannerManagement from './admin/BannerManagement';
import PhotoManagement from './admin/PhotoManagement';
import MediaManagement from './admin/MediaManagement';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');

  // Check admin access
  React.useEffect(() => {
    if (!isAdmin()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const tabs = [
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'events', label: 'Events', icon: '📅' },
    { id: 'registrations', label: 'Registrations', icon: '📝' },
    { id: 'banner', label: 'Banner', icon: '📢' },
    { id: 'photos', label: 'Photos', icon: '📸' },
    { id: 'media', label: 'Media', icon: '🖼️' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />;
      case 'events':
        return <EventManagement />;
      case 'registrations':
        return <EventRegistrations />;
      case 'banner':
        return <BannerManagement />;
      case 'photos':
        return <PhotoManagement />;
      case 'media':
        return <MediaManagement />;
      default:
        return <UserManagement />;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <button onClick={() => navigate('/dashboard')} className="btn-secondary">
          Back to User Dashboard
        </button>
      </div>

      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;

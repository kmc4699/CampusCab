import React, { useState } from 'react';

export default function MyRidesDashboard() {
  const [activeTab] = useState('upcoming');

  // TODO: MyRidesDashboard is a view containing two tabs/sections ("Upcoming" and "Past Rides") with empty state rendering.
  
  return (
    <div>
      <span hidden>{activeTab}</span>
      {/* TODO: Implement tab navigation between "Upcoming" and "Past Rides" */}
      {/* TODO: Implement empty state UI rendering for when no rides exist in the selected tab */}
    </div>
  );
}

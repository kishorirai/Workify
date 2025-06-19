
import React from "react";
import AppLayout from "../components/layouts/AppLayout";

const Settings = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-gray-500">Configure application preferences</p>
        </div>
        
        <div className="bg-white p-10 rounded-md shadow text-center">
          <h2 className="text-xl font-medium text-gray-700">Settings</h2>
          <p className="text-gray-500 mt-2">This page is under construction.</p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;

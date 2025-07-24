import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useNavigate, useLocation } from "react-router-dom";

function TabsNavBar({ compliedLicensing = false }) {
  console.log("TabsNavBar compliedLicensing:", compliedLicensing);
  const navigate = useNavigate();
  const location = useLocation();

  // Only show all tabs if compliedLicensing is true
  const tabRoutes = compliedLicensing
    ? [
        "/dashboards/facility-ownership",
        "/dashboards/service-offered",
        "/dashboards/inspection-schedule",
      ]
    : [
        "/dashboards/facility-ownership",
      ];

  const currentTabIndex = tabRoutes.indexOf(location.pathname);
  const tabIndex = currentTabIndex === -1 ? 0 : currentTabIndex;

  const handleTabChange = (event, newValue) => {
    navigate(tabRoutes[newValue]);
  };

  return (
    <Tabs value={tabIndex} onChange={handleTabChange} centered>
      <Tab label="Facility Ownership" />
      {compliedLicensing && <Tab label="Services Offered" />}
      {compliedLicensing && <Tab label="Inspection Schedule" />}
    </Tabs>
  );
}

export default TabsNavBar; 
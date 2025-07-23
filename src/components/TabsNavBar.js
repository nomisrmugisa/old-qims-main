import React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useNavigate, useLocation } from "react-router-dom";

function TabsNavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabRoutes = [
    "/dashboards/facility-ownership",
    "/dashboards/employee-registration",
    "/dashboards/service-offered",
    "/dashboards/inspection-schedule",
  ];

  const currentTabIndex = tabRoutes.indexOf(location.pathname);
  const tabIndex = currentTabIndex === -1 ? 0 : currentTabIndex;

  const handleTabChange = (event, newValue) => {
    navigate(tabRoutes[newValue]);
  };

  return (
    <Tabs value={tabIndex} onChange={handleTabChange} centered>
      <Tab label="Facility Ownership" />
      <Tab label="Employee Registration" />
      <Tab label="Services Offered" />
      <Tab label="Inspection Schedule" />
    </Tabs>
  );
}

export default TabsNavBar;


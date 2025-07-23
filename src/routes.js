/**
=========================================================
* Otis Admin PRO - v2.0.2
=========================================================

* Product Page: https://material-ui.com/store/items/otis-admin-pro-material-dashboard-react/
* Copyright 2024 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Otis Admin PRO React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that contains other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

import React from "react";
import Analytics from "layouts/dashboards/analytics";
import Sales from "layouts/dashboards/sales";
import ProfileOverview from "layouts/pages/profile/profile-overview";
import AllProjects from "layouts/pages/profile/all-projects";
import NewUser from "layouts/pages/users/new-user";
import Settings from "layouts/pages/account/settings";
import Billing from "layouts/pages/account/billing";
import Invoice from "layouts/pages/account/invoice";
import Timeline from "layouts/pages/projects/timeline";
import PricingPage from "layouts/pages/pricing-page";
import Widgets from "layouts/pages/widgets";
import RTL from "layouts/pages/rtl";
import Charts from "layouts/pages/charts";
import Notifications from "layouts/pages/notifications";
import Kanban from "layouts/applications/kanban";
import Wizard from "layouts/applications/wizard";
import DataTables from "layouts/applications/data-tables";
import Calendar from "layouts/applications/calendar";
import NewProduct from "layouts/ecommerce/products/new-product";
import EditProduct from "layouts/ecommerce/products/edit-product";
import ProductPage from "layouts/ecommerce/products/product-page";
import OrderList from "layouts/ecommerce/orders/order-list";
import OrderDetails from "layouts/ecommerce/orders/order-details";
import SignInBasic from "layouts/authentication/sign-in/basic";
import SignInCover from "layouts/authentication/sign-in/cover";
import SignInIllustration from "layouts/authentication/sign-in/illustration";
import SignUpCover from "layouts/authentication/sign-up/cover";
import ResetCover from "layouts/authentication/reset-password/cover";

import QimsHomePage from "qims/pages/qims-home";
import QimsLoginPage from "qims/pages/qims-login";

// Otis Admin PRO React components
import MDAvatar from "components/MDAvatar";

// @mui icons
import Icon from "@mui/material/Icon";

// Images
import profilePicture from "assets/images/team-3.jpg";
import EmployeeRegistration from "./layouts/dashboards/employee-registration";
import FacilityOwnership from "./layouts/dashboards/facility-ownership";
import ServiceOffered from "./layouts/dashboards/services-offered";
import InspectionSchedule from "./layouts/dashboards/inspection-schedule";

const routes = [
  {
    name: "Qims Home",
    key: "qims-components",
    route: "/qims/home",
    component: <QimsHomePage />,
  },
  {
    name: "Qims Login",
    key: "qims-login",
    route: "qims/login",
    component: <QimsLoginPage />,
  },
  {
    type: "collapse",
    name: "Brooklyn Alice",
    key: "brooklyn-alice",
    icon: <MDAvatar src={profilePicture} alt="Brooklyn Alice" size="sm" />,
    collapse: [
      {
        name: "My Profile",
        key: "my-profile",
        route: "/pages/profile/profile-overview",
        component: <ProfileOverview />,
      },
      {
        name: "Settings",
        key: "profile-settings",
        route: "/pages/account/settings",
        component: <Settings />,
      },
      { //used as login page
        name: "Logout",
        key: "logout",
        route: "/authentication/sign-in/basic",
        component: <SignInBasic />,
      },
    ],
  },
  { type: "divider", key: "divider-0" },
  {
    type: "collapse",
    name: "Dashboards",
    key: "dashboards",
    icon: <Icon fontSize="medium">dashboard</Icon>,
    collapse: [
      {
        name: "Complete Registration",
        key: "facility",
        route: "/dashboards/facility-ownership",
        component: <FacilityOwnership />,
      },
      {
        name: "Employee Registration",
        key: "employee",
        route: "/dashboards/employee-registration",
        component: <EmployeeRegistration />,
      },
      {
        name: "Service Offered",
        key: "service",
        route: "/dashboards/service-offered",
        component: <ServiceOffered />,
      },
      {
        name: "Inspection Schedule",
        key: "inspection",
        route: "/dashboards/inspection-schedule",
        component: <InspectionSchedule />,
      },
    ],
  },
  // { type: "title", title: "Pages", key: "title-pages" },
  // {
  //   type: "collapse",
  //   name: "Pages",
  //   key: "pages",
  //   icon: <Icon fontSize="medium">image</Icon>,
  //   collapse: [
  //     {
  //       name: "Profile",
  //       key: "profile",
  //       collapse: [
  //         {
  //           name: "Profile Overview",
  //           key: "profile-overview",
  //           route: "/pages/profile/profile-overview",
  //           component: <ProfileOverview />,
  //         },
  //         {
  //           name: "All Projects",
  //           key: "all-projects",
  //           route: "/pages/profile/all-projects",
  //           component: <AllProjects />,
  //         },
  //       ],
  //     },
  //     {
  //       name: "Users",
  //       key: "users",
  //       collapse: [
  //         {
  //           name: "New User",
  //           key: "new-user",
  //           route: "/pages/users/new-user",
  //           component: <NewUser />,
  //         },
  //       ],
  //     },
  //     {
  //       name: "Account",
  //       key: "account",
  //       collapse: [
  //         {
  //           name: "Settings",
  //           key: "settings",
  //           route: "/pages/account/settings",
  //           component: <Settings />,
  //         },
  //         {
  //           name: "Billing",
  //           key: "home",
  //           route: "/pages/account/home",
  //           component: <Billing />,
  //         },
  //         {
  //           name: "Invoice",
  //           key: "invoice",
  //           route: "/pages/account/invoice",
  //           component: <Invoice />,
  //         },
  //       ],
  //     },
  //     {
  //       name: "Projects",
  //       key: "projects",
  //       collapse: [
  //         {
  //           name: "Timeline",
  //           key: "timeline",
  //           route: "/pages/projects/timeline",
  //           component: <Timeline />,
  //         },
  //       ],
  //     },
  //     {
  //       name: "Pricing Page",
  //       key: "pricing-page",
  //       route: "/pages/pricing-page",
  //       component: <PricingPage />,
  //     },
  //     { name: "RTL", key: "rtl", route: "/pages/rtl", component: <RTL /> },
  //     { name: "Widgets", key: "widgets", route: "/pages/widgets", component: <Widgets /> },
  //     { name: "Charts", key: "charts", route: "/pages/charts", component: <Charts /> },
  //     {
  //       name: "Notfications",
  //       key: "notifications",
  //       route: "/pages/notifications",
  //       component: <Notifications />,
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   name: "Applications",
  //   key: "applications",
  //   icon: <Icon fontSize="medium">apps</Icon>,
  //   collapse: [
  //     {
  //       name: "Kanban",
  //       key: "kanban",
  //       route: "/applications/kanban",
  //       component: <Kanban />,
  //     },
  //     {
  //       name: "Wizard",
  //       key: "wizard",
  //       route: "/applications/wizard",
  //       component: <Wizard />,
  //     },
  //     {
  //       name: "Data Tables",
  //       key: "data-tables",
  //       route: "/applications/data-tables",
  //       component: <DataTables />,
  //     },
  //     {
  //       name: "Calendar",
  //       key: "calendar",
  //       route: "/applications/calendar",
  //       component: <Calendar />,
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   name: "Ecommerce",
  //   key: "ecommerce",
  //   icon: <Icon fontSize="medium">shopping_basket</Icon>,
  //   collapse: [
  //     {
  //       name: "Products",
  //       key: "products",
  //       collapse: [
  //         {
  //           name: "New Product",
  //           key: "new-product",
  //           route: "/ecommerce/products/new-product",
  //           component: <NewProduct />,
  //         },
  //         {
  //           name: "Edit Product",
  //           key: "edit-product",
  //           route: "/ecommerce/products/edit-product",
  //           component: <EditProduct />,
  //         },
  //         {
  //           name: "Product Page",
  //           key: "product-page",
  //           route: "/ecommerce/products/product-page",
  //           component: <ProductPage />,
  //         },
  //       ],
  //     },
  //     {
  //       name: "Orders",
  //       key: "orders",
  //       collapse: [
  //         {
  //           name: "Order List",
  //           key: "order-list",
  //           route: "/ecommerce/orders/order-list",
  //           component: <OrderList />,
  //         },
  //         {
  //           name: "Order Details",
  //           key: "order-details",
  //           route: "/ecommerce/orders/order-details",
  //           component: <OrderDetails />,
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   name: "Authentication",
  //   key: "authentication",
  //   icon: <Icon fontSize="medium">content_paste</Icon>,
  //   collapse: [
  //     {
  //       name: "Sign In",
  //       key: "sign-in",
  //       collapse: [
  //         {
  //           name: "Basic",
  //           key: "basic",
  //           route: "/authentication/sign-in/basic",
  //           component: <SignInBasic />,
  //         },
  //         {
  //           name: "Cover",
  //           key: "cover",
  //           route: "/authentication/sign-in/cover",
  //           component: <SignInCover />,
  //         },
  //         {
  //           name: "Illustration",
  //           key: "illustration",
  //           route: "/authentication/sign-in/illustration",
  //           component: <SignInIllustration />,
  //         },
  //       ],
  //     },
  //     {
  //       name: "Sign Up",
  //       key: "sign-up",
  //       collapse: [
  //         {
  //           name: "Cover",
  //           key: "cover",
  //           route: "/authentication/sign-up/cover",
  //           component: <SignUpCover />,
  //         },
  //       ],
  //     },
  //     {
  //       name: "Reset Password",
  //       key: "reset-password",
  //       collapse: [
  //         {
  //           name: "Cover",
  //           key: "cover",
  //           route: "/authentication/reset-password/cover",
  //           component: <ResetCover />,
  //         },
  //       ],
  //     },
  //   ],
  // },
  // { type: "divider", key: "divider-1" },
  // { type: "title", title: "Docs", key: "title-docs" },
  // {
  //   type: "collapse",
  //   name: "Basic",
  //   key: "basic",
  //   icon: <Icon fontSize="medium">upcoming</Icon>,
  //   collapse: [
  //     {
  //       name: "Getting Started",
  //       key: "getting-started",
  //       collapse: [
  //         {
  //           name: "Overview",
  //           key: "overview",
  //           href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/overview/otis-admin/",
  //         },
  //         {
  //           name: "License",
  //           key: "license",
  //           href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/license/otis-admin/",
  //         },
  //         {
  //           name: "Quick Start",
  //           key: "quick-start",
  //           href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/quick-start/otis-admin/",
  //         },
  //         {
  //           name: "Build Tools",
  //           key: "build-tools",
  //           href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/build-tools/otis-admin/",
  //         },
  //       ],
  //     },
  //     {
  //       name: "Foundation",
  //       key: "foundation",
  //       collapse: [
  //         {
  //           name: "Colors",
  //           key: "colors",
  //           href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/colors/otis-admin/",
  //         },
  //         {
  //           name: "Grid",
  //           key: "grid",
  //           href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/grid/otis-admin/",
  //         },
  //         {
  //           name: "Typography",
  //           key: "base-typography",
  //           href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/base-typography/otis-admin/",
  //         },
  //         {
  //           name: "Borders",
  //           key: "borders",
  //           href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/borders/otis-admin/",
  //         },
  //         {
  //           name: "Box Shadows",
  //           key: "box-shadows",
  //           href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/box-shadows/otis-admin/",
  //         },
  //         {
  //           name: "Functions",
  //           key: "functions",
  //           href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/functions/otis-admin/",
  //         },
  //         {
  //           name: "Routing System",
  //           key: "routing-system",
  //           href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/routing-system/otis-admin/",
  //         },
  //       ],
  //     },
  //   ],
  // },
  // {
  //   type: "collapse",
  //   name: "Components",
  //   key: "components",
  //   icon: <Icon fontSize="medium">view_in_ar</Icon>,
  //   collapse: [
  //     {
  //       name: "Alerts",
  //       key: "alerts",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/alerts/otis-admin/",
  //     },
  //     {
  //       name: "Avatar",
  //       key: "avatar",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/avatar/otis-admin/",
  //     },
  //     {
  //       name: "Badge",
  //       key: "badge",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/badge/otis-admin/",
  //     },
  //     {
  //       name: "Badge Dot",
  //       key: "badge-dot",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/badge-dot/otis-admin/",
  //     },
  //     {
  //       name: "Box",
  //       key: "box",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/box/otis-admin/",
  //     },
  //     {
  //       name: "Buttons",
  //       key: "buttons",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/buttons/otis-admin/",
  //     },
  //     {
  //       name: "Date Picker",
  //       key: "date-picker",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/datepicker/otis-admin/",
  //     },
  //     {
  //       name: "Dropzone",
  //       key: "dropzone",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/dropzone/otis-admin/",
  //     },
  //     {
  //       name: "Editor",
  //       key: "editor",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/quill/otis-admin/",
  //     },
  //     {
  //       name: "Input",
  //       key: "input",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/input/otis-admin/",
  //     },
  //     {
  //       name: "Pagination",
  //       key: "pagination",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/pagination/otis-admin/",
  //     },
  //     {
  //       name: "Progress",
  //       key: "progress",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/progress/otis-admin/",
  //     },
  //     {
  //       name: "Snackbar",
  //       key: "snackbar",
  //       href: "https://www.creative-tim.com/learning-lab/material-ui-marketplace/snackbar/otis-admin/",
  //     },
  //   ],
  // },
];

export default routes;

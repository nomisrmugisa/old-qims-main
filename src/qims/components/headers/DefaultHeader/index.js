import "bootstrap/dist/css/bootstrap.min.css";

import MDBox from "components/MDBox";
import DefaultNavbar from "qims/components/navbars/DefaultNavbar";
import pageRoutes from "page.routes";
import colors from "assets/theme/base/colors";

function DefaultHeader() {
  return (
    <>
      <DefaultNavbar routes={pageRoutes} transparent light />
      <MDBox
        position="relative"
        minHeight="32vh"
        height="32vh"
        sx={{
          backgroundColor: colors.homeGradient,
        }}
      />
    </>
  );
}

export default DefaultHeader;

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

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// Otis Admin PRO React components
import MDBox from "components/MDBox";

// Otis Admin PRO React example components
import DefaultPricingCard from "examples/Cards/PricingCards/DefaultPricingCard";

// Otis Admin PRO React context
import { useMaterialUIController } from "context";

function PricingCards({ prices }) {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const [starter, enterprise] = prices;
  return (
    <MDBox position="relative" zIndex={10} mt={8} px={{ xs: 1, sm: 0 }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} lg={8} border="1px solid black">
          <DefaultPricingCard
            color={darkMode ? "dark" : "white"}
            price={{ currency: "", value: starter, type: "mo" }}
            // action={{null}}
            shadow={darkMode}
          />
        </Grid>

        <Grid item xs={12} lg={4} border="1px solid black">
          <DefaultPricingCard
            color={darkMode ? "dark" : "white"}
            price={{ currency: "", value: enterprise, type: "" }}
            shadow={darkMode}
          />
        </Grid>
      </Grid>
    </MDBox>
  );
}

// Typechecking props for the PricingCards
PricingCards.propTypes = {
  prices: PropTypes.instanceOf(Array).isRequired,
};

export default PricingCards;

import { Box, CircularProgress, Container, ThemeProvider, useMediaQuery } from "@mui/material";
import NavBar from "../../layout/NavBar";
import NavBarBot from "../../layout/NavBarBot";
import HeaderCard from "../../layout/HeaderCard";
import BackButton from "../../util/buttons/BackButton";
import { darkTheme } from "../../../theme/darkTheme";

function PageShell({
  title,
  subtitle,
  icon,
  children,
  maxWidth = "md",
  loading = false,
  showBackButton = true,
  bottomNavProps,
  bottomNav,
  contentSx,
  pageSx,
}) {
  const isMobile = useMediaQuery(darkTheme.breakpoints.down("md"));

  return (
    <>
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 4, ...pageSx }}>
          <NavBar />
          <Container maxWidth={maxWidth} sx={{ pt: { xs: 2, md: 4 }, ...contentSx }}>
            {showBackButton && !isMobile && <BackButton />}
            {title && <HeaderCard title={title} subtitle={subtitle} icon={icon} />}
            {loading ? (
              <CircularProgress
                sx={{
                  position: "absolute",
                  top: "45%",
                  left: "45%",
                  display: "block",
                  mx: "auto",
                  mb: 2,
                }}
              />
            ) : (
              children
            )}
          </Container>
        </Box>
      </ThemeProvider>
      {bottomNav !== undefined ? bottomNav : <NavBarBot {...bottomNavProps} />}
    </>
  );
}

export default PageShell;

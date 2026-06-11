
import { Box, Container, LinearProgress,ThemeProvider } from "@mui/material";
import { darkTheme } from "../../theme/darkTheme";
import LoadingNavBarBot from "./LoadingNavBarBot";
import NavBar from "./NavBar";

const LoadingPage = () => {

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
                    <NavBar />
                    <Container maxWidth="lg" sx={{ pt: 4 }}>
                        <LinearProgress />
                    </Container>
                </Box>
            </ThemeProvider>
            <LoadingNavBarBot />
        </>
    );
};

export default LoadingPage;
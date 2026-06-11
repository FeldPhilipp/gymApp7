import { ThemeProvider, Box, Skeleton, useMediaQuery } from "@mui/material";
import { darkTheme } from "../../theme/darkTheme";

const LoadingNavBarBot = () => {
    const isMobile = useMediaQuery(darkTheme.breakpoints.down('md'));

    if (!isMobile) {
        return null;
    }

    return (
        <ThemeProvider theme={darkTheme}>
            <Box sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
                height: '64px',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                px: 2,
                zIndex: 1000,
                boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
            }}>
                {/* Erster Button (zurück/sideBtn1) */}
                <Skeleton 
                    variant="rounded" 
                    width={40} 
                    height={40} 
                    sx={{ 
                        borderRadius: '16px',
                        bgcolor: 'rgba(255, 255, 255, 0.05)'
                    }} 
                />

                {/* Zweiter Button (sideBtn2) - unsichtbarer Platzhalter */}
                <Box sx={{ width: 40, height: 40 }} />

                {/* Haupt-Button (mainBtn) */}
                <Skeleton 
                    variant="circular" 
                    width={56} 
                    height={56} 
                    sx={{ 
                        position: 'relative',
                        top: '-16px',
                        bgcolor: 'rgba(59, 130, 246, 0.2)'
                    }} 
                />

                {/* Dritter Button (sideBtn3) - unsichtbarer Platzhalter */}
                <Box sx={{ width: 40, height: 40 }} />

                {/* Menu Button */}
                <Skeleton 
                    variant="rounded" 
                    width={40} 
                    height={40} 
                    sx={{ 
                        borderRadius: '16px',
                        bgcolor: 'rgba(59, 130, 246, 0.15)'
                    }} 
                />
            </Box>
        </ThemeProvider>
    );
}

export default LoadingNavBarBot;
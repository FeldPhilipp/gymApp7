// import React, { useState } from 'react';
// import {
//   IconButton,
//   Menu,
//   MenuItem,
//   ListItemIcon,
//   ListItemText,
//   Divider,
//   Switch,
//   Box,
//   Typography,
//   useMediaQuery,
// } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
// import LightbulbIcon from '@mui/icons-material/Lightbulb';
// import RestartAltIcon from '@mui/icons-material/RestartAlt';
// import { useTips } from '../context/TipsContext';

// /**
//  * FloatingTipsButton
//  * Schwebendes Button-Element für Mobile Devices
//  * Positioniert unten rechts, knapp über der NavBarBot
//  */
// const FloatingTipsButton = () => {
//   const { tipsEnabled, toggleTips, resetViewedTips } = useTips();
//   const [anchorEl, setAnchorEl] = useState(null);
//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//   // Nur auf Mobile zeigen
//   if (!isMobile) return null;

//   const handleClick = (e) => {
//     setAnchorEl(e.currentTarget);
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const handleToggleTips = () => {
//     toggleTips(!tipsEnabled);
//   };

//   const handleReset = () => {
//     resetViewedTips();
//     handleClose();
//   };

//   return (
//     <>
//       {/* Schwebendes Button-Element */}
//       <Box
//         sx={{
//           position: 'fixed',
//           bottom: '80px', // Knapp über der NavBarBot (64px) + Abstand (16px)
//           right: '16px',
//           zIndex: 50, // Über NavBarBot (z-index: 1000) aber unter Modals
//           display: { xs: 'flex', sm: 'flex', md: 'none' },
//         }}
//       >
//         <IconButton
//           onClick={handleClick}
//           sx={{
//             backgroundColor: tipsEnabled ? '#ff9800' : '#999',
//             color: '#fff',
//             width: '56px',
//             height: '56px',
//             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
//             '&:hover': {
//               backgroundColor: tipsEnabled ? '#f57c00' : '#777',
//               boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)',
//             },
//             transition: 'all 0.3s ease',
//             animation: tipsEnabled ? 'pulse 2s infinite' : 'none',
//             '@keyframes pulse': {
//               '0%': {
//                 boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
//               },
//               '50%': {
//                 boxShadow: '0 4px 20px rgba(255, 152, 0, 0.5)',
//               },
//               '100%': {
//                 boxShadow: '0 4px 12px rgba(255, 152, 0, 0.3)',
//               },
//             },
//           }}
//           title="Tipps & Hilfen"
//         >
//           <LightbulbIcon />
//         </IconButton>
//       </Box>

//       {/* Dropdown Menu */}
//       <Menu
//         anchorEl={anchorEl}
//         open={Boolean(anchorEl)}
//         onClose={handleClose}
//         anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//         transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
//       >
//         <Box sx={{ px: 2, py: 1 }}>
//           <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#999' }}>
//             TIPPS & HILFEN
//           </Typography>
//         </Box>

//         <MenuItem onClick={handleToggleTips}>
//           <ListItemIcon>
//             <Switch
//               checked={tipsEnabled}
//               onChange={handleToggleTips}
//               size="small"
//             />
//           </ListItemIcon>
//           <ListItemText
//             primary="Tipps anzeigen"
//             secondary={tipsEnabled ? 'Aktiviert' : 'Deaktiviert'}
//             secondaryTypographyProps={{ variant: 'caption' }}
//           />
//         </MenuItem>

//         <Divider sx={{ my: 0.5 }} />

//         <MenuItem onClick={handleReset} disabled={!tipsEnabled}>
//           <ListItemIcon>
//             <RestartAltIcon fontSize="small" />
//           </ListItemIcon>
//           <ListItemText 
//             primary="Alle Tipps neu anzeigen"
//             primaryTypographyProps={{ variant: 'body2' }}
//           />
//         </MenuItem>
//       </Menu>
//     </>
//   );
// };

// export default FloatingTipsButton;

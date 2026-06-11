import React from 'react';
import { Card, CardContent } from '@mui/material';

const CustomCardHeader = ({child}) => {
    return (
        <Card sx={{ mb: 2, borderRadius: "16px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 }, height: "100%" }}>
                {child}
            </CardContent>
        </Card>
    );
}

export default CustomCardHeader;

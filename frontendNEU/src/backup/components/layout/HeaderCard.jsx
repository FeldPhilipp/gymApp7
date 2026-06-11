import { Card, CardContent, Typography } from "@mui/material"

function HeaderCard({ title, subtitle, icon }) {
    return (
        <Card sx={{ mb: 2, borderRadius: "16px", background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
            <CardContent sx={{ paddingTop: "24px", height: "100%" }}>
                <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600, mb: subtitle && 2 }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography variant="body1" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    )
}

export default HeaderCard

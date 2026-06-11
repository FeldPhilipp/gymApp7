import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ func }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (typeof func === 'function') {
            func();
        } else {
            navigate(-1);
        }
    };

    return (
        <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowBackIcon />}
            onClick={handleClick}
            sx={{
                color: '#d1d5db',
                borderColor: 'rgba(59, 130, 246, 0.3)',
                borderRadius: '16px',
                backgroundColor: '#111827',
                textTransform: 'none',
                fontWeight: 500,
                padding: '6px 12px',
                marginBottom: "20px",
                '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130 , 246, 0.5)',
                    boxShadow: '0 0 8px rgba(59, 130, 246, 0.3)',
                },
                transition: 'all 0.3s ease-in-out',
            }}
        >
            Zurück
        </Button>
    );
}

export default BackButton;

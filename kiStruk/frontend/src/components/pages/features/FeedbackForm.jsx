import { useState } from "react";
import { Card, CardContent } from "@mui/material";
import BugReportIcon from "@mui/icons-material/BugReport";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useApiProtectionContext } from "../../context/ApiProtectionContext";
import { FeedbackApi } from "../../../services/api";
import Notification from "../../util/notifications/Notification";
import PageShell from "../../shared/ui/PageShell";
import useNotificationMessage from "../../shared/hooks/useNotificationMessage";
import FeedbackFields from "./components/FeedbackFields";

const feedbackTypes = [
  { value: "fehler", icon: BugReportIcon },
  { value: "verbesserung", icon: TrendingUpIcon },
  { value: "wunsch", icon: StarIcon },
];

function FeedbackForm() {
  const { nutzer } = useAuth();
  const { protect } = useApiProtectionContext();
  const navigate = useNavigate();
  const { message, showMessage, clearMessage, hasMessage } = useNotificationMessage();
  const [formData, setFormData] = useState({
    typ: "fehler",
    titel: "",
    beschreibung: "",
  });
  const [loading, setLoading] = useState(false);

  const CurrentIcon = feedbackTypes.find((feedbackType) => feedbackType.value === formData.typ)?.icon;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await protect("send-feedback", async () => {
        await FeedbackApi.createFeedback({
          nutzer_id: nutzer.id,
          typ: formData.typ,
          titel: formData.titel,
          beschreibung: formData.beschreibung,
        });

        showMessage("success", "Danke fuer dein Feedback!");
        setFormData({ typ: "fehler", titel: "", beschreibung: "" });

        setTimeout(() => {
          clearMessage();
          navigate("/dashboard");
        }, 2000);
      });
    } catch (error) {
      console.error("Fehler beim Speichern des Feedbacks:", error);
      showMessage("error", "Fehler beim Speichern des Feedbacks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell title="Feedback geben" icon={CurrentIcon ? <CurrentIcon /> : null}>
      {hasMessage && (
        <Notification type={message.type} message={message.text} onClose={clearMessage} />
      )}

      <Card sx={{ boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <FeedbackFields formData={formData} onChange={handleChange} loading={loading} />
          </form>
        </CardContent>
      </Card>
    </PageShell>
  );
}

export default FeedbackForm;

import { useState, useEffect } from "react";
import { AdminApi } from "../../../services/api";
import { Button } from "@mui/material";
import EventIcon from '@mui/icons-material/Event';

const Logs = ({ setLoading }) => {

    const [logs, setLogs] = useState({ out: "", error: "" });

    // useEffect(() => {
    //     AdminApi.getLogs()
    //         // .then(res => res.json())
    //         .then(data => setLogs(data.logs))
    //         .catch(err => console.error(err));
    // }, []);

    // const fetchLogs = async () => {
    //     setLoading(true);
    //     try {
    //         const response = await AdminApi.getLogs();
    //         console.log(response.data.logs.json());
    //         // console.log(JSON.parse(response.data.logs.error));
    //         // setLogs(JSON.parse(response.data.logs.error));
    //         // Hier kannst du die Logs weiterverarbeiten oder anzeigen
    //     } catch (err) {
    //         console.error(err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <div>
            <Button
                variant="contained"
                startIcon={<EventIcon />}
                // onClick={fetchLogs}
                sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
            >
                Logs herunterladen
            </Button>

            {logs.out || logs.error ? (
                <div style={{ padding: 20, fontFamily: "monospace" }}>
                    <h2>Server-Logs</h2>

                    <h3>Output</h3>
                    <pre style={{ background: "#111", color: "#0f0", padding: "10px", borderRadius: 5, whiteSpace: "pre-wrap" }}>
                        {logs.out}
                    </pre>

                    <h3>Error</h3>
                    <pre style={{ background: "#111", color: "#f44", padding: "10px", borderRadius: 5, whiteSpace: "pre-wrap" }}>
                        {logs.error}
                    </pre>
                </div>
            ) : null}
        </div>
    );
}

export default Logs;

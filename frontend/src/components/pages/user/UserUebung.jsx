import { useState, useEffect } from "react";
import NavBar from "../../layout/NavBar";
import NavBarBot from "../../layout/NavBarBot";
import { ThemeProvider, Box, Container, Button } from "@mui/material";
import { darkTheme } from '../../../theme/darkTheme';
import { UserApi } from "../../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useApiProtectionContext } from "../../context/ApiProtectionContext";
import { TextField } from "@mui/material";


const UserUebung = () => {
    const { nutzer } = useAuth();
    const { protect } = useApiProtectionContext();
    const [newUebung, setNewUebung] = useState({
        name: '',
        zielmuskel: '',
        kategorie: '',
        beschreibung: '',
    });
    const [uebungenByNutzer, setUebungenByNutzer] = useState([]);

    const fetchNutzerUebungen = async () => {
        await protect("Trainingsergebnisse - createSessionMitHistorie", async () => {
            console.log(nutzer)
            try {
                const response = await UserApi.nutzerUebungen(nutzer.id);
                console.log("User Exercises:", response.data);
                setUebungenByNutzer(response.data);
            } catch (error) {
                console.error("Error fetching user exercises:", error);
            }
        });
    };

    useEffect(() => {
        fetchNutzerUebungen();
    }, [window.location.href]);

    useEffect(() => {
        console.log(uebungenByNutzer)
    }, [uebungenByNutzer]);

    const handleChange = (e) => {
        setNewUebung({
            ...newUebung,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await protect("UserUebung - createNewUebung", async () => {
            try {
                const response = await UserApi.newNutzerUebung({
                    ...newUebung,
                    nutzerId: nutzer.id,
                });
                console.log("Exercise created successfully:", response.data);
                setNewUebung({
                    name: '',
                    zielmuskel: '',
                    kategorie: '',
                    beschreibung: '',
                })
                fetchNutzerUebungen();
            } catch (error) {
                console.error("Error creating exercise:", error);
            }
        });
    };

    return (
        <>
            <ThemeProvider theme={darkTheme}>
                <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 4 }}>
                    <NavBar />
                    <Container>
                        <form onSubmit={handleSubmit}>
                            <TextField value={newUebung.name} name="name" required onChange={(e) => handleChange(e)} />
                            <TextField value={newUebung.zielmuskel} name="zielmuskel" required onChange={(e) => handleChange(e)} />
                            <select name="kategorie" value={newUebung.kategorie} required onChange={(e) => handleChange(e)}>
                                <option value=""></option>
                                <option value="Push">Push</option>
                                <option value="Pull">Pull</option>
                                <option value="Beine">Beine</option>
                            </select>
                            <TextField value={newUebung.beschreibung} name="beschreibung" required onChange={(e) => handleChange(e)} />
                            <button type="submit">Übung erstellen</button>
                        </form>
                        { }
                    </Container>
                    <Button variant="contained" onClick={fetchNutzerUebungen}>
                        Lade Nutzer Übungen
                    </Button>
                    {uebungenByNutzer.length > 0 &&
                        <table style={{ backgroundColor: "white" }}>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Zielmuskel</th>
                                    <th>Kategorie</th>
                                    <th>Beschreibung</th>
                                </tr>
                            </thead>
                            <tbody>
                                {uebungenByNutzer.map((uebung) => (
                                    <tr key={uebung.id}>
                                        <td>{uebung.name}</td>
                                        <td>{uebung.zielmuskel}</td>
                                        <td>{uebung.kategorie}</td>
                                        <td>{uebung.beschreibung}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    }
                </Box>
            </ThemeProvider >
            <NavBarBot />
        </>
    );
}

export default UserUebung;

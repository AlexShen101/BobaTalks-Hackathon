import { useState } from 'react';
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import EventCard from "../components/EventCard";
import Backdrop from '@mui/material/Backdrop';

export default function SemanticSearchPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchTerm.trim()) return;

        setIsLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_ENDPOINT}/api/events/search`,
                {
                    params: { query: searchTerm },
                    withCredentials: true
                }
            );
            const sortedResults = response.data.sort((a, b) => b.score - a.score);
            setSearchResults(sortedResults);
            setHasSearched(true);
        } catch (error) {
            console.error('Semantic search error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isLoading}
            >
                <div style={{ textAlign: 'center' }}>
                    <CircularProgress color="inherit" />
                    <Typography sx={{ mt: 2 }}>
                        Analyzing your search...
                    </Typography>
                </div>
            </Backdrop>

            <Container
                className="width-no-space"
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pt: { xs: 12, sm: 12 },
                    pb: { xs: 12, sm: 12 },
                    px: { xs: 2, sm: 4 },
                    backgroundColor: '#D3E9FF',
                    minHeight: '100vh',
                }}
            >
                <Typography
                    sx={{
                        fontFamily: "Poppins",
                        mb: 4,
                        color: '#021944',
                        fontWeight: 'bold',
                        width: '100%',
                        textAlign: { xs: 'center', sm: 'left' }
                    }}
                    variant="h4"
                >
                    Semantic Event Search
                </Typography>

                <div style={{
                    display: 'flex',
                    width: '100%',
                    gap: '10px',
                    marginBottom: '20px',
                    alignItems: 'center'
                }}>
                    <input
                        type="text"
                        placeholder="Describe the type of event you're looking for..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '12px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '16px'
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={handleSearch}
                        disabled={isLoading || !searchTerm.trim()}
                    >
                        Search
                    </Button>
                </div>

                <Grid container spacing={3} justifyContent="center">
                    {hasSearched ? (
                        searchResults.length > 0 ? (
                            searchResults.map((event, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <EventCard event={event} manageEventView={false} />
                                </Grid>
                            ))
                        ) : (
                            <Typography variant="h6" sx={{ mt: 4 }}>
                                No matching events found
                            </Typography>
                        )
                    ) : (
                        <Typography variant="body1" sx={{ mt: 4, color: 'text.secondary' }}>
                            Try searching for events using natural language!
                        </Typography>
                    )}
                </Grid>
            </Container>
        </>
    );
}
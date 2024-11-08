import { useState, useEffect } from 'react';
import EventCard from "../components/EventCard";
import axios from 'axios';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Psychology from '@mui/icons-material/Psychology';
import Tooltip from '@mui/material/Tooltip';
import { useNavigate } from 'react-router-dom';

import '../styles/Card.css'

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_ENDPOINT}/api/events`,
          { withCredentials: true }
        );

        const events = response.data.map(event => ({
          ...event,
          endDate: new Date(event.endDate),
          startDate: new Date(event.startDate)
        }));

        setEvents(events);
      } catch (error) {
        console.log(error);
      }
    };

    fetchEvents();
  }, []);

  const filteredEvents = events.filter(event =>
    event.eventName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
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
          Upcoming Events
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
            placeholder="Search events..."
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
          <Tooltip title="Try semantic search">
            <IconButton
              onClick={() => navigate('/SemanticSearch')}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.light',
                }
              }}
            >
              <Psychology />
            </IconButton>
          </Tooltip>
        </div>

        <Grid container spacing={3} justifyContent="center">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <EventCard event={event} manageEventView={false} />
              </Grid>
            ))
          ) : (
            <Typography variant="h6">No events found</Typography>
          )}
        </Grid>
      </Container>
    </>
  );
}
import React, { useState } from 'react';
import { Link } from 'react-router-dom'
import '../styles/Card.css'
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';

export default function EventCard({event, manageEventView, deleteEvent}) {
    const progress = (event.currentMoney / event.goalAmount) * 100;

    return (
        <div className='card'>
        <div className="column">
            <h1>{event.eventName}</h1>
            <p><i>Organized by: {event.organizers}</i></p>
            <p>{event.eventDescription}</p>
            <Tooltip title={`Current Money: ${event.currentMoney}, Goal: ${event.goalAmount}`}>
                <LinearProgress variant="determinate" value={progress}
                sx={{ 
                height: '20px', 
                borderRadius: '20px',
                backgroundColor: 'white', 
                '& .MuiLinearProgress-bar': { 
                borderRadius: '20px', 
                backgroundColor: 'green.500', 
                } 
            }}  />
            </Tooltip>    
        </div>

        <div className="column">
            <p style={{ marginLeft: "10vw"}}>Ending on {event.endDate.toISOString().substring(0, 10)}</p>
            {event.imageUrl ? (
            <img
                src={event.imageUrl}
                height="150px"
                width="250px"
                style={{ marginLeft: "10vw", objectFit: 'cover', borderRadius: '10px'}}
                alt="Event Image"
            />
            ) : null} 
            {!manageEventView && (
                <Link to={`DonatePage/${event._id}`} style={{ marginLeft: "10vw"}}>
                    <Button 
                        color="custom"
                        variant="outlined"
                    >Donate
                    </Button>
                </Link>
            )}
            {manageEventView && (
                <>
                    <Link to={`EditEvent/${event._id}`} style={{ marginRight: "1vw", marginLeft: "10vw"}}>
                        <Button color="custom"
                        variant="outlined">
                            Edit Event
                        </Button>
                    </Link>
                    <Button color="custom"
                    variant="outlined"
                    onClick={() => deleteEvent(event._id)}>
                        Delete Event
                    </Button>
                </>
            )}
        </div>
        </div>
    );
}
import React, { Component } from 'react';
import { Grid, Button, Typography, responsiveFontSizes} from "@material-ui/core";


export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
        };
        this.roomCode = this.props.match.params.roomCode;
        // !!!getting the specific parameter (code of the room from the url) from HomePage.js!!!
        this.getRoomDetails();
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
    }

    getRoomDetails() {
        fetch('/api/get-room' + '?code=' + this.roomCode)
        .then((response) => {
            if (!response.ok) { // the user in a room that doesnt exist
                this.props.leaveRoomCallback();
                this.props.history.push("/");
            }
            return response.json();
        })
        .then((data) => {
            this.setState({
                votesToSkip: data.votes_to_skip,
                guestCanPause: data.guest_can_pause,
                isHost: data.is_host,
            })
        });
    }

    leaveButtonPressed() {
        const requestOptions = {
            method: "POST",
            Headers: {"Content-Type": "application/json"}
        };
        fetch('/api/leave-room', requestOptions).then((_response) => { // We dont really care what the response is thats why we used '_'
            this.props.leaveRoomCallback();
            this.props.history.push("/");
        });
    }
    
    render() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <Typography variant="h4" component="h4">
                        Code: {this.roomCode}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography variant="h6" component="h6">
                        Votes: {this.state.votesToSkip}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography variant="h6" component="h6">
                        Guest Can Pause: {this.state.guestCanPause.toString()}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <Typography variant="h6" component="h6">
                        Host: {this.state.isHost.toString()}
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" onClick={ this.leaveButtonPressed }>
                        Leave Room
                    </Button>
                </Grid>
            </Grid>            
        )
    }
}

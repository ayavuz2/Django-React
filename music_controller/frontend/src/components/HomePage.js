import React, { Component } from 'react';
import RoomJoinPage from './RoomJoinPage';
import CreateRoomPage from './CreateRoomPage';
import Room from "./Room";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";
import { 
    BrowserRouter as Router, 
    Switch, 
    Route, 
    Link, 
    Redirect,
} from "react-router-dom";


export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: null,
        }
    }

    // async keyword is basically telling the program that it doesnt need to wait the method ends before doing anything else 
    async componentDidMount() { // search lifecycle methods on web
        fetch('/api/user-in-room')
        .then((response) => response.json())
        .then((data) => {
            this.setState({
                roomCode: data.code,
            })
        })
    }

    renderHomePage() {
        return (
            <Grid container spacing={3}>
                <Grid item xs={12} align="center">
                    <Typography variant="h3" component="h3">
                        House Party
                    </Typography>
                </Grid>
                <Grid item xs={12} align="center">
                    <ButtonGroup disableElevation variant="contained" color="primary">
                        <Button color="primary" to="/join" component={ Link }>
                            Join a Room
                        </Button>
                        <Button color="secondary" to="/create" component={ Link }>
                            Create a Room
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        );
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route exact path='/' render={() => { // If the user was already in a room then redirect to the room that it was in
                        return this.state.roomCode ? (
                            <Redirect to={`/room/${this.state.roomCode}`} />) : (this.renderHomePage()
                        )
                    }} />
                    <Route path='/join' component={RoomJoinPage} />
                    <Route path='/create' component={CreateRoomPage} />
                    <Route path='/room/:roomCode' component={Room} />
                </Switch>
            </Router>
        );
    }
}
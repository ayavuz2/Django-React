import React, { Component } from 'react';
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import ChatBox, { ChatFrame } from 'react-chat-plugin';


export default class Room extends Component {
    constructor(props) {
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false,
            showSettings: false,
            spotifyAuthenticated: false,
            song: {},
            messages: [],
        };
        this.roomCode = this.props.match.params.roomCode;
        // !!!getting the specific parameter (code of the room from the url) from HomePage.js!!!
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
        this.updateShowSettings = this.updateShowSettings.bind(this);
        this.renderSettingsButton = this.renderSettingsButton.bind(this); 
        this.renderSettings = this.renderSettings.bind(this);
        this.getRoomDetails = this.getRoomDetails.bind(this);
        this.authenticateSpotify = this.authenticateSpotify.bind(this);
        this.getCurrentSong = this.getCurrentSong.bind(this);
        this.handleOnSendMessage = this.handleOnSendMessage.bind(this);
        this.sendMessageBackend = this.sendMessageBackend.bind(this);
        this.getRoomMessages = this.getRoomMessages.bind(this);
        this.printMessage = this.printMessage.bind(this);
        this.getRoomDetails();
    }

    componentDidMount() {
        this.interval = setInterval(() => {
            this.getCurrentSong();
            this.getRoomMessages();
        }, 1000) // calling getCurrenSong function every second
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }
    
    getRoomDetails() {
        // console.log("HEY");
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
            });
            // console.log(data.is_host);
            // this.setState does not update itself instantly so below if statement is not working properly all the time with this.state.isHost
            if (data.is_host) {
                this.authenticateSpotify();
            };
        });
    }

    authenticateSpotify() {
        fetch("/spotify/is-authenticated")
            .then((response) => response.json())
            .then((data) => {
                // console.log(data.status);
                this.setState({ spotifyAuthenticated: data.status });
                if (!data.status) { // if the function returns False
                fetch('/spotify/get-auth-url')
                    .then((response) => response.json())
                    .then((data) => {
                        window.location.replace(data.url); // redirecting to spotify authorization page
                });
            }
        });
    }

    getCurrentSong() {
        fetch("/spotify/current-song")
            .then((response) => {
                if(!response.ok) {
                    // console.log(1);
                    return {};
                }
                else {
                    // console.log(2);
                    return response.json();
                }
            })
            .then((data) => {
                console.log(data);
                this.setState({ song: data });
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
    
    updateShowSettings(value) {
        this.setState({
            showSettings: value,
        });
    }

    getRoomMessages() {
        fetch("/api/get-room-messages").then((response) => {
            if (response.status === 200) {
                return response.json();
            }
            else {
                return {};
            }
        }).then((data) => {
            // console.log(data);
            var i;
            for(i=0; i<data.length; i++) {
                this.printMessage(data[i].author, data[i].content)
            }
        });
    }

    sendMessageBackend(message) {
        const requestOptions = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: message,
            }),
        };

        fetch("/api/send-message", requestOptions)
        .then((response) => {
            if (response.ok) {
                return response.json();
            }
            else {
                return {};
            }
        });
    }

    printMessage(author, message) {
        var author_id = (author === true) ? 1 : 2;
        var author_name = (author === true) ? "me" : "them";
        
        this.setState({
            messages: this.state.messages.concat({ 
                author: {
                    username: author_name,
                    id: author_id,
                },
                text: message,
                //timestamp: +new Date(),
                type: 'text',
            }),
        });
    }

    handleOnSendMessage(message) {
        this.printMessage(true, message);
        this.sendMessageBackend(message);
    }

    renderSettings() {
        return (
            <Grid container spacing={1}>
                <Grid item xs={12} align="center">
                    <CreateRoomPage 
                        update={true} 
                        votesToSkip={this.state.votesToSkip} 
                        guestCanPause={this.state.guestCanPause} 
                        roomCode={this.roomCode}
                        updateCallback={this.getRoomDetails}
                    />
                </Grid>
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" onClick={() => this.updateShowSettings(false)}>
                        Close
                    </Button>
                </Grid>
            </Grid>
        );
    }

    renderSettingsButton() {
        return (
            <Grid item xs={12} align="center">
                <Button variant="contained" color="primary" onClick={() => this.updateShowSettings(true)}>
                    Settings
                </Button>
            </Grid>
        );
    }
    
    render() {
        if (this.state.showSettings) {
            return this.renderSettings();
        };
        return (
            <Grid container spacing={1} justify="center" align="center">
                <Grid item xs={12} align="center">
                    <Typography variant="h4" component="h4">
                        Code: {this.roomCode}
                    </Typography>
                </Grid>
                <MusicPlayer {...this.state.song} /* We can access the song data in MusicPlayer now, using this.props.(...)*/ />
                {this.state.isHost ? this.renderSettingsButton() : null}
                <Grid item xs={12} align="center">
                    <Button variant="contained" color="secondary" onClick={ this.leaveButtonPressed }>
                        Leave Room
                    </Button>
                </Grid>
                
                <div className='chatbox'>
                    <Grid container justify="flex-end" align="flex-end">
                        <ChatBox 
                            messages={this.state.messages} 
                            userId={1} 
                            onSendMessage={this.handleOnSendMessage} 
                            width={'100%'} 
                            height={'500px'}
                        />
                    </Grid>
                </div>
            </Grid>
        );
    }
}

import React, { Component } from 'react';


import { Grid, Typography, Card, IconButton, LinearProgress } from "@material-ui/core";


import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import SkipNextIcon from "@material-ui/icons/SkipNext";
import PauseIcon from "@material-ui/icons/Pause";


export default class MusicPlayer extends Component {
    constructor(props) {
        super(props);
    }

    // Skipping feature only works for Premium Spotify Users !!!
    skipSong() {
        const requestOptions = {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
        };
        fetch("/spotify/skip", requestOptions);
    }

    // Play/Pause feature only works for Premium Spotify Users !!!
    pauseSong() {
        const requestOptions = {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
        };
        fetch("/spotify/pause", requestOptions);
    }

    // Play/Pause feature only works for Premium Spotify Users !!!
    playSong() {
        const requestOptions = {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
        };
        fetch("/spotify/play", requestOptions);
    }

    render() {
        const songProgress = (this.props.time / this.props.duration) * 100;

        return (
            <Card>
                <Grid container alignItems="center">
                    <Grid item align="center" xs= {4}>
                        <img src={this.props.image_url} height="100%" width="100%" />
                    </Grid>
                    <Grid item align="center" xs= {8}>
                        <Typography component="h5" variant="h5">
                            {this.props.title}
                        </Typography>
                        <Typography color="textSecondary" variant="subtitle1">
                            {this.props.artist}
                        </Typography>
                        <div>
                            <IconButton onClick={() => this.props.is_playing ? this.pauseSong() : this.playSong()}>
                                {this.props.is_playing ? <PauseIcon /> : <PlayArrowIcon />}
                            </IconButton>
                            <IconButton>
                                {this.props.votes} / {this.props.votes_required} <SkipNextIcon onClick={() => this.skipSong() }/>
                                {/* Binding is not necessary if you call the function through an arrow function "() => {...}" like we did above  */}
                                {/* Just for the record, we do not even have to this bacuse we are not using "this" keyword in skipSong function :)*/}
                            </IconButton>
                        </div>
                    </Grid>
                </Grid>
                
                <LinearProgress variant="determinate" value={songProgress} />
            </Card>
        )
    }
}

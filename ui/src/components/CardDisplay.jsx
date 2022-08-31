import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';

import { makeStyles } from '@mui/styles';

import BaseballCard from './BaseballCard.jsx';

const useStyles = makeStyles((theme) => {
  return {
    root: {
      marginTop: theme.spacing(2),
    },
    paper: {
      padding: theme.spacing(3),
      minWidth: '200px',
    },
    loading: {
      marginBottom: theme.spacing(2),
    },
  };
});

const CardDisplay = ({ playerNames, handleClick }) => {
  const classes = useStyles();

  const isReady = playerNames && playerNames.length > 0;

  const cards = playerNames.map((playerName) => (
    <Grid item sm={5} md={3} key={playerName}>
      <BaseballCard
        playerName={playerName}
        key={playerName}
        handleClick={handleClick}
      />
    </Grid>
  ));

  return (
    <Container>
      <Grid container className={classes.root}>
        <Grid container justify="space-evenly">
          <Paper className={classes.paper} elevation={0}>
            {!isReady && (
              <CircularProgress size="2rem" classes={classes.loading} />
            )}
            <Typography>
              {isReady
                ? 'Click on a card below to make an offer to buy the card.'
                : 'Fetching card list...'}
            </Typography>
          </Paper>
        </Grid>
        <Grid
          container
          alignItems="stretch"
          direction="row"
          justify="space-evenly"
        >
          {cards}
        </Grid>
      </Grid>
    </Container>
  );
};

export default CardDisplay;

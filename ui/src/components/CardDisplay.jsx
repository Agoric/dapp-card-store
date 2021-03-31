import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';

import BaseballCard from './BaseballCard.jsx';

const useStyles = makeStyles((theme) => {
  return {
    root: {
      marginTop: theme.spacing(2),
    },
    paper: {
      padding: theme.spacing(3),
    },
  };
});

const CardDisplay = ({ playerNames, handleClick }) => {
  const classes = useStyles();

  const cards = playerNames.map((playerName) => (
    <BaseballCard playerName={playerName} handleClick={handleClick} />
  ));

  return (
    <Container>
      <Grid container className={classes.root}>
        <Paper className={classes.paper}>
          <Typography>
            First, please enable this dapp in your wallet. To open your wallet,
            enter `agoric open` in your terminal.
          </Typography>
          <Typography>
            Then click on a card below to make an offer to buy the card.
          </Typography>
        </Paper>
        {cards}
      </Grid>
    </Container>
  );
};

export default CardDisplay;

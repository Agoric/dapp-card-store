import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

import BaseballCard from './BaseballCard.jsx';

const useStyles = makeStyles((_theme) => {
  return {
    baseballCard: {},
    media: {},
  };
});

const CardDisplay = ({
  playerNames,
  walletP,
  cardPurse,
  tokenPurse,
  pricePerCard,
}) => {
  const classes = useStyles();

  const cards = playerNames.map((playerName) => (
    <BaseballCard
      playerName={playerName}
      walletP={walletP}
      cardPurse={cardPurse}
      tokenPurse={tokenPurse}
      pricePerCard={pricePerCard}
    />
  ));

  return (
    <Grid container className={classes.root}>
      <Typography>
        First, please enable this dapp in your wallet. To open your wallet,
        enter `agoric open` in your terminal.
      </Typography>
      <Typography>
        Then click on a card below to make an offer to buy the card.
      </Typography>
      {cards}
    </Grid>
  );
};

export default CardDisplay;

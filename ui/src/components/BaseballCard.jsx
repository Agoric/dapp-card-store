import React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

import { makeOfferForCards } from '../makeOfferForCards';

const useStyles = makeStyles((_theme) => {
  return {
    baseballCard: {},
    media: {},
  };
});

const BaseballCard = ({
  playerName,
  walletP,
  cardPurse,
  tokenPurse,
  pricePerCard,
}) => {
  const classes = useStyles();

  const makeOffer = (name) =>
    makeOfferForCards({
      walletP,
      cards: harden([name]),
      cardPurse,
      tokenPurse,
      pricePerCard,
    });

  return (
    <Grid item sm={12} md={2}>
      <Card className={classes.baseballCard}>
        <CardActionArea onClick={() => makeOffer(playerName)}>
          <CardMedia
            className={classes.media}
            image={`/cards/${playerName}.jpg`}
            title={playerName}
          />
        </CardActionArea>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {playerName}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );
};

export default BaseballCard;

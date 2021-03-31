import React from 'react';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((_theme) => {
  return {
    baseballCard: {},
    media: {},
  };
});

const BaseballCard = ({ playerName, handleClick }) => {
  const classes = useStyles();

  return (
    <Grid item sm={12} md={2}>
      <Card className={classes.baseballCard}>
        <CardActionArea onClick={() => handleClick(playerName)}>
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

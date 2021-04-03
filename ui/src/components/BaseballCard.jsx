import React from 'react';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';

import { makeStyles } from '@material-ui/core/styles';

import { images } from '../images';

const useStyles = makeStyles((theme) => {
  return {
    baseballCard: {
      fontWeight: 'bold',
      position: 'relative',
      margin: theme.spacing(2),
      height: '360px',
    },
    media: {
      height: 0,
      paddingTop: '100%',
    },
    cardWrapper: {},
    cardText: {},
  };
});

const BaseballCard = ({ playerName, handleClick }) => {
  const classes = useStyles();

  return (
    <Card className={classes.baseballCard}>
      <CardActionArea onClick={() => handleClick(playerName)}>
        <CardMedia
          className={classes.media}
          image={images[playerName]}
          title={playerName}
        />
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="h2"
            className={classes.cardText}
          >
            {playerName}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};

export default BaseballCard;

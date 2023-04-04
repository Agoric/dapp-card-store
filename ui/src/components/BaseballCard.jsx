import React, { Fragment } from 'react';
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
  const CardContainer = handleClick ? CardActionArea : Fragment;
  const containerProps = handleClick
    ? {
        onClick: () => handleClick(playerName),
      }
    : {};

  return (
    <Card className={classes.baseballCard}>
      <CardContainer {...containerProps}>
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
      </CardContainer>
    </Card>
  );
};

export default BaseballCard;

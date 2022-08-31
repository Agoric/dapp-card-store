import React, { Fragment } from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

import { makeStyles } from '@mui/styles';

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

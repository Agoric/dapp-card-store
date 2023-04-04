import React from 'react';
import Box from '@material-ui/core/Box';

import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { stringifyValue } from '../utils/amount';

const toDateString = (bigIntTs) => {
  const ts = parseInt(bigIntTs.toString(), 10);
  return new Date(ts * 1000).toISOString();
};

const useStyles = makeStyles((theme) => {
  return {
    root: {
      marginBottom: theme.spacing(2),
    },
    item: {
      marginBottom: theme.spacing(0.5),
      '& strong': {
        display: 'inline-block',
        minWidth: '200px',
      },
    },
    history: {
      background: '#f5f5f5',
      padding: theme.spacing(1),
      maxHeight: '120px',
      overflow: 'scroll',
    },
    historyItem: {
      marginBottom: theme.spacing(1),
    },
  };
});

const AuctionSessionDetail = ({
  bidDuration,
  bids,
  closesAfter,
  minimumBid,
  winnerPriceOption,
  tokenPetname,
  tokenDisplayInfo,
  timeUnit = 'second',
}) => {
  const classes = useStyles();
  const showHistory = Array.isArray(bids);
  const isHistoryEmpty = showHistory && bids.length < 1;

  return (
    <Box className={classes.root}>
      <Typography className={classes.item}>
        <strong>Duration:</strong> {stringifyValue(bidDuration)} {timeUnit}(s)
      </Typography>
      <Typography className={classes.item}>
        <strong>Winner price option:</strong> {winnerPriceOption}
      </Typography>
      <Typography className={classes.item}>
        <strong>Minimum bid:</strong>{' '}
        {stringifyValue(minimumBid.value, tokenDisplayInfo)} {tokenPetname}
      </Typography>
      {closesAfter ? (
        <Typography className={classes.item}>
          <strong>Closes after:</strong> {toDateString(closesAfter)}
        </Typography>
      ) : (
        <Typography className={classes.item}>
          <strong>Status:</strong> Not started.
        </Typography>
      )}
      {showHistory ? (
        <Box className={classes.item}>
          <Typography>
            <strong>History</strong>
          </Typography>
          <Box className={classes.history}>
            {isHistoryEmpty
              ? 'No bid for now. Session will be started after the first bid.'
              : bids.map((amount, idx) => (
                  <Typography className={classes.historyItem} key={idx}>
                    {stringifyValue(amount.value, tokenDisplayInfo)}{' '}
                    {tokenPetname}
                  </Typography>
                ))}
          </Box>
        </Box>
      ) : (
        <Typography className={classes.item}>
          <strong>Bids:</strong> {bids}
        </Typography>
      )}
    </Box>
  );
};

export default AuctionSessionDetail;

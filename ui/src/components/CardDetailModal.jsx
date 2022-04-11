import React, { useEffect, useState } from 'react';
import Box from '@material-ui/core/Box';
import Modal from '@material-ui/core/Modal';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

import BaseballCard from './BaseballCard.jsx';
import AuctionSessionDetail from './AuctionSessionDetail.jsx';
import CardAuctionForm from './CardAuctionForm.jsx';

const useStyles = makeStyles((theme) => {
  return {
    root: {
      position: 'relative',
      margin: 'auto', // theme.spacing(4),
      marginTop: theme.spacing(12),
      display: 'flex',
      background: 'white',
      borderRadius: '4px',
      maxWidth: '960px',
      alignItems: 'center',
    },
    closeBtn: {
      position: 'absolute',
      top: theme.spacing(0.5),
      right: theme.spacing(0.5),
    },
    card: {
      width: '360px',
    },
    detail: {
      padding: theme.spacing(3),
      marginLeft: theme.spacing(2),
      marginBottom: theme.spacing(2),
      flex: 1,
    },
    loading: {
      marginBottom: theme.spacing(2),
    },
    heading: {
      fontWeight: 600,
      fontSize: '20px',
      marginBottom: theme.spacing(1),
    },
    bidForm: {
      marginBottom: theme.spacing(1),
    },
    bidFormItem: {
      marginBottom: theme.spacing(1),
    },
  };
});

const CardDetailModal = ({
  open,
  onClose,
  playerName,
  tokenPurses,
  tokenPetname,
  tokenDisplayInfo,
  onGetCardDetail,
  onBidCard,
}) => {
  const classes = useStyles();
  const [state, setDetailState] = useState({});

  useEffect(() => {
    let isActive = true;
    const cancelFn = () => {
      isActive = false;
    };

    if (!playerName) {
      setDetailState({
        details: null,
        error: null,
      });
      return cancelFn;
    }

    onGetCardDetail(playerName)
      .then((result) => {
        if (!isActive) {
          return;
        }
        setDetailState({
          details: result,
          error: null,
        });
      })
      .catch((error) => {
        setDetailState({
          details: null,
          error: error.message,
        });
      });

    return cancelFn;
  }, [playerName]);

  const submitBidOffer = (...args) => {
    if (!onBidCard) {
      return null;
    }
    return onBidCard(playerName, ...args).then(onClose);
  };
  const { details, error } = state;

  return (
    <Modal open={open} onClose={onClose}>
      <Box className={classes.root}>
        <IconButton className={classes.closeBtn} onClick={onClose}>
          <CloseIcon />
        </IconButton>
        <Box className={classes.card}>
          <BaseballCard imageOnly playerName={playerName} />
        </Box>
        <Box className={classes.detail}>
          {error && <Typography color="error">{error}</Typography>}
          {details ? (
            <>
              <AuctionSessionDetail
                bidDuration={details.bidDuration}
                bids={details.bids}
                closesAfter={details.closesAfter}
                minimumBid={details.minimumBid}
                winnerPriceOption={details.winnerPriceOption}
                tokenPetname={tokenPetname}
                tokenDisplayInfo={tokenDisplayInfo}
              />
              <CardAuctionForm
                minimumBid={details.minimumBid}
                winnerPriceOption={details.winnerPriceOption}
                tokenPetname={tokenPetname}
                tokenPurses={tokenPurses}
                tokenDisplayInfo={tokenDisplayInfo}
                onSubmit={submitBidOffer}
              />
            </>
          ) : (
            <Box textAlign="center" marginTop="40px">
              <CircularProgress size="2rem" />
              <Typography>Fetching details...</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default CardDetailModal;

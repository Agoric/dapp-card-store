import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

const BoughtCardSnackbar = ({ open, onClose }) => {
  return (
    <Snackbar
      open={open}
      message="You just bought a baseball card! Check your Card purse in
    your wallet to see the cards you own."
      autoHideDuration={5000}
      onClose={onClose}
    />
  );
};

export default BoughtCardSnackbar;

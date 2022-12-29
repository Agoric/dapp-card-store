import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

const ApproveOfferSnackbar = ({ open, onClose }) => {
  // The snackbar to approve the offer will be closed by code not timeout.

  return (
    <Snackbar
      open={open}
      autoHideDuration={5000}
      message="Please approve the offer in your wallet to receive the payment."
      onClose={onClose}
    />
  );
};

export default ApproveOfferSnackbar;

import React from 'react';
import Snackbar from '@material-ui/core/Snackbar';

const ApproveOfferSnackbar = ({ open }) => {
  // The snackbar to approve the offer will be closed by code not timeout.

  return (
    <Snackbar
      open={open}
      autoHideDuration={null}
      message="Please approve the offer in your wallet to receive the payment."
    />
  );
};

export default ApproveOfferSnackbar;

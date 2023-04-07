import React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import enableDappPng from '../assets/enable-dapp.png';

const EnableAppDialog = ({ open, handleClose }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>Enable the Dapp</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Before using this dapp, you must enable it. To enable the dapp, please
          open your wallet by using the `agoric open` command in your terminal.
          Then, in the Dashboard, accept the connection between the wallet and
          cardStore dapp.
          <img
            id="enable-dapp"
            src={enableDappPng}
            width="100%"
            alt="Accept dapp connection in wallet"
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EnableAppDialog;

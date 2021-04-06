import React from 'react';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import enableDappPng from '../assets/enable-dapp.png';

const EnableAppDialog = ({ open, handleClose }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>Enable the Dapp</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Before using the dapp, you must enable it. To enable the dapp, please
          open your wallet by using the `agoric open` command in your terminal.
          Then, under Dapps, enable CardStore.
          <img
            id="enable-dapp"
            src={enableDappPng}
            width="100%"
            alt="Enable dapp in wallet"
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

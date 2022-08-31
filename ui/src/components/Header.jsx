import React from 'react';
import Typography from '@mui/material/Typography';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme) => {
  return {
    root: {
      paddingBottom: theme.spacing(3),
    },
    status: {
      marginRight: theme.spacing(2),
      textAlign: 'right',
    },
    title: {
      marginRight: theme.spacing(3),
    },
    icon: {
      marginRight: theme.spacing(1),
      marginLeft: 'auto',
    },
  };
});

const Header = ({ walletConnected, dappApproved }) => {
  const classes = useStyles();

  const walletStatus = walletConnected ? 'Connected' : 'Disconnected';
  const dappStatus = dappApproved ? 'Approved' : 'Not approved';
  return (
    <div className={classes.root}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Baseball Card Store
          </Typography>

          <PowerSettingsNewIcon className={classes.icon} />

          <div className={classes.status}>Wallet {walletStatus}</div>
          <PowerSettingsNewIcon className={classes.icon} />
          <div className={classes.status}>Dapp {dappStatus}</div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;

import React from 'react';
import Typography from '@material-ui/core/Typography';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((_theme) => {
  return {
    root: {},
    status: {},
    title: {},
    icon: {},
  };
});

const Header = ({ walletConnected }) => {
  const classes = useStyles();

  const walletStatus = walletConnected ? 'Connected' : 'Disconnected';
  return (
    <div className={classes.root}>
      <AppBar>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            Baseball Card Store
          </Typography>

          <PowerSettingsNewIcon className={classes.icon} />

          <div className={classes.status}>Agoric wallet: {walletStatus}</div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;

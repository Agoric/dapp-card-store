import React from 'react';
import Typography from '@material-ui/core/Typography';
import PowerSettingsNewIcon from '@material-ui/icons/PowerSettingsNew';

import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(_theme => {
  return {
    root: {

    },
    menuButton: {

    }
    title: {

    }
  }
});

const Header = ({ walletStatus }) => {

  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar>
        <Toolbar>
          <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
            <PowerSettingsNewIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
          Baseball Card Store
          </Typography>
          <div class="status">
            Agoric wallet: <span id="wallet-status">{walletStatus}</span>
          </div>
        </Toolbar>
      </AppBar>
    </div>
  )
}


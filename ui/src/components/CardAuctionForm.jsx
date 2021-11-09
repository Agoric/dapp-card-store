import React, { useState } from 'react';
import Box from '@material-ui/core/Box';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import { makeValue, stringifyValue } from '../utils/amount';

const useStyles = makeStyles((theme) => {
  return {
    root: {},
    item: {
      marginBottom: theme.spacing(1),
    },
  };
});

const CardAuctionForm = ({ tokenPurses, tokenDisplayInfo, onSubmit }) => {
  const classes = useStyles();
  const [state, setFormState] = useState({
    error: null,
    isSubmitting: false,
  });
  const [selectedPurse, setSelectedPurse] = useState(
    tokenPurses && tokenPurses[0],
  );
  const [amount, setAmount] = useState(0);

  const submitBidOffer = () => {
    if (!onSubmit) {
      return null;
    }

    setFormState({
      isSubmitting: true,
    });
    const price = makeValue(amount, tokenDisplayInfo);
    return onSubmit(price, selectedPurse)
      .then(() => {
        setFormState({
          error: null,
        });
      })
      .catch((err) => {
        setFormState({
          error: err.message,
        });
      });
  };

  const { error, isSubmitting } = state;

  return (
    <Box className={classes.root}>
      {error && <Typography color="error">{error}</Typography>}
      <FormControl className={classes.item} fullWidth>
        <InputLabel id="auction-purse-select-label">Purse</InputLabel>
        <Select
          labelId="auction-purse-select-label"
          className={classes.purseSelect}
          value={selectedPurse}
          onChange={(event) => {
            setSelectedPurse(event.target.value);
          }}
        >
          {tokenPurses.map((p) => (
            <MenuItem key={p.pursePetname} value={p} disabled={!p.value}>
              {p.pursePetname} ({stringifyValue(p.value, p.displayInfo)}{' '}
              {p.brandPetname})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <FormControl className={classes.item} fullWidth>
        <TextField
          id="outlined-error"
          label="Bid amount"
          type="number"
          value={amount}
          onChange={(event) => {
            setAmount(event.target.value);
          }}
        />
      </FormControl>
      <FormControl className={classes.item} fullWidth>
        <Button
          disabled={isSubmitting}
          onClick={submitBidOffer}
          variant="contained"
          color="primary"
        >
          {isSubmitting ? 'Submitting' : 'Bid'}
        </Button>
      </FormControl>
    </Box>
  );
};

export default CardAuctionForm;

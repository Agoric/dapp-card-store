import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';

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

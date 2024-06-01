//Created by Georgina Alacaraz
import { Dialog, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import React, { CSSProperties } from 'react';

/* DEVELOPER NOTE:
* this card displays the Sign-In alert when a user is not signed in
*/

interface Props {
  onSignIn: () => void,
  onModalClose: () => void,
}

export default function SignIn(props: Props) {
  return (
    <div>
      <p style={{ fontWeight: 'bold' }}>You need to sign in first.</p>
      <div>
        <button onClick={props.onSignIn} style={{ marginRight: '1em' }}>Sign in</button>
        <button onClick={props.onModalClose}>Close</button>
      </div>
    </div>
  )
}

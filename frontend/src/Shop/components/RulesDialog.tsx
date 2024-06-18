import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';

interface RulesDialogProps {
  open: boolean;
  onClose: () => void;
}

const RulesDialog: React.FC<RulesDialogProps> = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Community Rules</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Here are the rules for creating and managing your community:
          <ol>
            <li>Be respectful to all members.</li>
            <li>No spamming or self-promotion without permission.</li>
            <li>Maintain a positive and inclusive environment.</li>
            <li>Report any inappropriate behavior to the admins.</li>
            <li>Follow all platform guidelines and terms of service.</li>
          </ol>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RulesDialog;

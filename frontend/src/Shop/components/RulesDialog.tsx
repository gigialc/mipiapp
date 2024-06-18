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
      <DialogTitle>How to earn pi? 💸 </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Here are some ways to earn pi tokens 💕
          <ol>
            <li>Create a community.</li>
            <li>Create quality posts and earn 1 pi per comment.</li>
            <li>Contribute to a community and earn tokens by the number of likes your post/comments receive. </li>
          </ol>
          Tokenomics example:
          <ul>
            <li>Community subscribers: 1000</li>
            <li>Cost of subscription: 2 Pi</li>
            <li>Total pi: 1000 * 2 = 2000/month</li>
            <li>30% goes to the community owner → 600 tokens</li>
            <li>1400 is the rest of the token pool</li>
            <li>400 total likes</li>
            <li>If you own 100 likes from the pool</li>
            <li>100 likes → 25% of likes pool</li>
            <li>1400 * 0.25 = 350 Pi for YOU</li>
          </ul>
          
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

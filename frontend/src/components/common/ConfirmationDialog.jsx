import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

const ConfirmationDialog = ({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  message,
  content,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'background.paper',
          boxShadow: 8,
          p: 0,
        }
      }}
    >
      <DialogTitle id="alert-dialog-title" sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, pb: 1 }}>{title}</DialogTitle>
      <DialogContent sx={{ p: { xs: 2, sm: 4, md: 5 } }}>
        {content ? (
          content
        ) : (
          <DialogContentText id="alert-dialog-description">
            {message}
          </DialogContentText>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, pt: 2 }}>
        <Button onClick={onClose} variant="outlined">{cancelText}</Button>
        <Button onClick={onConfirm} color="primary" variant="contained" autoFocus>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationDialog;
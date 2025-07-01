import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
  Slide,
  Fade
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const Transition = React.forwardRef(function Transition(props, ref) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  if (isMobile) {
    return <Slide direction="up" ref={ref} {...props} timeout={300} />;
  }
  return <Fade ref={ref} {...props} timeout={200} />;
});

const ModalWrapper = ({
  open,
  onClose,
  title,
  icon: Icon,
  children,
  actions,
  maxWidth = 'md',
  fullWidth = true,
  scroll = 'paper',
  loading = false,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClose = (event, reason) => {
    if (loading) {
      return; // Prevent closing while loading
    }
    onClose(event, reason);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      scroll={scroll}
      TransitionComponent={Transition}
      keepMounted={false}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          margin: isMobile ? 0 : 2,
          maxHeight: isMobile ? '100vh' : '90vh',
          width: isMobile ? '100vw' : 'auto',
          height: isMobile ? '100vh' : 'auto',
          WebkitOverflowScrolling: 'touch',
          '@media (max-width: 600px)': {
            '& input, & textarea, & select': {
              fontSize: '16px',
            },
          },
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: isMobile ? 'flex-end' : 'center',
          '@media (max-width: 600px)': {
            padding: 0,
          },
        },
        '& .MuiButton-root': {
          minHeight: isMobile ? 48 : 36,
          fontSize: isMobile ? '1rem' : '0.875rem',
        },
        '& .MuiIconButton-root': {
          minWidth: isMobile ? 48 : 40,
          minHeight: isMobile ? 48 : 40,
        },
      }}
      {...props}
    >
      {/* Title Section */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          backgroundColor: 'background.paper',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {Icon && (
            <Icon 
              sx={{ 
                color: 'primary.main',
                fontSize: 24 
              }} 
            />
          )}
          <Typography 
            variant="h6" 
            component="h2"
            id="modal-title"
            sx={{ 
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            {title}
          </Typography>
        </Box>
        
        <IconButton
          onClick={(e) => handleClose(e, 'closeButton')}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              backgroundColor: 'action.hover',
            }
          }}
          disabled={loading}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content Section */}
      <DialogContent
        dividers={scroll === 'paper'}
        id="modal-description"
        sx={{
          padding: theme.spacing(3),
          '&.MuiDialogContent-dividers': {
            borderTop: 'none',
          },
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: '4px',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
          },
          '&:focus': {
            outline: 'none',
          },
        }}
        tabIndex={-1}
      >
        {children}
      </DialogContent>

      {/* Actions Section */}
      {actions && (
        <DialogActions
          sx={{
            padding: theme.spacing(2, 3),
            borderTop: 1,
            borderColor: 'divider',
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'background.paper',
            zIndex: 1,
            gap: 1,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default ModalWrapper;

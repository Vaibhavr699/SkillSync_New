// import { useState, useEffect } from 'react';
// import { 
//   Box, 
//   Typography, 
//   List, 
//   ListItem, 
//   ListItemAvatar, 
//   ListItemText,
//   Avatar,
//   Badge,
//   IconButton,
//   Popover,
//   Button,
//   Divider
// } from '@mui/material';
// import { Notifications as NotificationsIcon } from '@mui/icons-material';
// import { useDispatch, useSelector } from 'react-redux';
// import { 
//   fetchNotifications, 
//   markNotificationAsRead, 
//   markAllNotificationsAsRead 
// } from '../../store/slices/notificationSlice';

// const NotificationsDropdown = () => {
//   const [anchorEl, setAnchorEl] = useState(null);
//   const dispatch = useDispatch();
//   const { notifications, unreadCount } = useSelector(state => state.notifications);
//   const open = Boolean(anchorEl);

//   const handleClick = (event) => {
//     setAnchorEl(event.currentTarget);
//     dispatch(fetchNotifications());
//   };

//   const handleClose = () => {
//     setAnchorEl(null);
//   };

//   const handleMarkAsRead = (notificationId) => {
//     dispatch(markNotificationAsRead(notificationId));
//   };

//   const handleMarkAllAsRead = () => {
//     dispatch(markAllNotificationsAsRead());
//   };

//   const getNotificationIcon = (type) => {
//     switch(type) {
//       case 'task_assigned':
//         return <AssignmentIcon color="primary" />;
//       case 'project_update':
//         return <WorkIcon color="secondary" />;
//       case 'message':
//         return <ChatIcon color="info" />;
//       default:
//         return <NotificationsIcon color="action" />;
//     }
//   };

//   return (
//     <>
//       <IconButton 
//         color="inherit" 
//         onClick={handleClick}
//         aria-label="notifications"
//       >
//         <Badge badgeContent={unreadCount} color="error">
//           <NotificationsIcon />
//         </Badge>
//       </IconButton>

//       <Popover
//         open={open}
//         anchorEl={anchorEl}
//         onClose={handleClose}
//         anchorOrigin={{
//           vertical: 'bottom',
//           horizontal: 'right',
//         }}
//         transformOrigin={{
//           vertical: 'top',
//           horizontal: 'right',
//         }}
//         sx={{ 
//           maxHeight: '400px',
//           width: '350px'
//         }}
//       >
//         <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
//           <Typography variant="h6">Notifications</Typography>
//           {unreadCount > 0 && (
//             <Button 
//               size="small" 
//               onClick={handleMarkAllAsRead}
//             >
//               Mark all as read
//             </Button>
//           )}
//         </Box>
//         <Divider />

//         {notifications.length === 0 ? (
//           <Box sx={{ p: 2, textAlign: 'center' }}>
//             <Typography variant="body2" color="text.secondary">
//               No notifications
//             </Typography>
//           </Box>
//         ) : (
//           <List sx={{ width: '100%', maxHeight: '300px', overflow: 'auto' }}>
//             {notifications.map((notification) => (
//               <Box key={notification._id}>
//                 <ListItem 
//                   alignItems="flex-start"
//                   sx={{
//                     bgcolor: notification.isRead ? 'background.default' : 'action.selected',
//                     cursor: 'pointer',
//                     '&:hover': {
//                       bgcolor: 'action.hover'
//                     }
//                   }}
//                   onClick={() => handleMarkAsRead(notification._id)}
//                 >
//                   <ListItemAvatar>
//                     {getNotificationIcon(notification.type)}
//                   </ListItemAvatar>
//                   <ListItemText
//                     primary={notification.title}
//                     secondary={
//                       <>
//                         <Typography
//                           component="span"
//                           variant="body2"
//                           color="text.primary"
//                           sx={{ display: 'block' }}
//                         >
//                           {notification.message}
//                         </Typography>
//                         <Typography
//                           component="span"
//                           variant="caption"
//                           color="text.secondary"
//                         >
//                           {new Date(notification.createdAt).toLocaleString()}
//                         </Typography>
//                       </>
//                     }
//                   />
//                 </ListItem>
//                 <Divider component="li" />
//               </Box>
//             ))}
//           </List>
//         )}

//         <Box sx={{ p: 1, textAlign: 'center' }}>
//           <Button size="small">View all notifications</Button>
//         </Box>
//       </Popover>
//     </>
//   );
// };

// export default NotificationsDropdown;
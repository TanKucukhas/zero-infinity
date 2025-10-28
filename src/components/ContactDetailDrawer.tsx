"use client";
import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Card,
  CardContent,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
  Star as StarIcon,
  Notes as NotesIcon
} from '@mui/icons-material';
import { useUser } from '@/contexts/user-context';
import { useNotifications } from '@/contexts/notification-context';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  emailPrimary: string;
  emailSecondary: string;
  company: {
    id: number;
    name: string;
    website: string;
    linkedinUrl: string;
    industry: string;
    size: string;
    description: string;
    logoUrl: string;
  };
  imdb: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  wikipedia: string;
  biography: string;
  priority: string;
  seenFilm: boolean;
  docBranchMember: boolean;
  location: {
    countryCode: string;
    stateCode: string;
    cityId: number;
    stateText: string;
    cityText: string;
    countryName: string;
    stateName: string;
    cityName: string;
  };
  isActive: boolean;
  inactiveReason: string;
  inactiveAt: number;
  createdAt: number;
  assignedUserIds: number[];
  assignedUserNames: string;
  relationshipLabels: string[];
  lastOutreachAt: number;
  notes: Note[];
  outreachEvents: any[];
  history: any[];
}

interface Note {
  id: number;
  contact_id: number;
  scope: string;
  body: string;
  author_user_id: number;
  author_name: string;
  is_edited: boolean;
  edited_at: number;
  created_at: number;
}

interface ContactDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  contactId: string | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`contact-tabpanel-${index}`}
      aria-labelledby={`contact-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ContactDetailDrawer({ open, onClose, contactId }: ContactDetailDrawerProps) {
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [newNoteBody, setNewNoteBody] = useState('');
  const [newNoteScope, setNewNoteScope] = useState('general');
  const [addingNote, setAddingNote] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editNoteBody, setEditNoteBody] = useState('');
  const [editNoteScope, setEditNoteScope] = useState('general');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  const { user } = useUser();
  const { addNotification } = useNotifications();

  // Check if user can add notes
  const canAddNotes = user && ['editor', 'admin'].includes(user.role);

  // Check if user can edit/delete a note
  const canEditNote = (note: Note) => {
    if (!user || !note) return false;
    if (user.role === 'admin') return true;
    // Strict comparison - user can only edit their own notes
    return parseInt(user.id) === parseInt(note.author_user_id.toString());
  };

  // Fetch contact details
  const fetchContact = async () => {
    if (!contactId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/contacts/${contactId}`, {
        headers: {
          'x-user': JSON.stringify(user)
        }
      });

      const result = await response.json();

      if (result.success) {
        setContact(result.data);
      } else {
        setError(result.error || 'Failed to load contact');
        addNotification({
          type: 'error',
          title: 'Error loading contact',
          message: result.error || 'Something went wrong'
        });
      }
    } catch (error) {
      console.error('Error fetching contact:', error);
      setError('Network error');
      addNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to connect to server'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new note
  const addNote = async () => {
    if (!contactId || !newNoteBody.trim()) return;

    setAddingNote(true);

    try {
      const response = await fetch(`/api/contacts/${contactId}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user': JSON.stringify(user)
        },
        body: JSON.stringify({
          body: newNoteBody.trim(),
          scope: newNoteScope
        })
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Note added',
          message: 'Note has been added successfully'
        });
        setNewNoteBody('');
        setNewNoteScope('general');
        fetchContact(); // Refresh contact data
      } else {
        addNotification({
          type: 'error',
          title: 'Error adding note',
          message: result.error || 'Something went wrong'
        });
      }
    } catch (error) {
      console.error('Error adding note:', error);
      addNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to add note'
      });
    } finally {
      setAddingNote(false);
    }
  };

  // Edit note
  const editNote = async () => {
    if (!contactId || !editingNote || !editNoteBody.trim()) return;

    setSavingNote(true);

    try {
      const response = await fetch(`/api/contacts/${contactId}/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user': JSON.stringify(user)
        },
        body: JSON.stringify({
          body: editNoteBody.trim(),
          scope: editNoteScope
        })
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Note updated',
          message: 'Note has been updated successfully'
        });
        setEditDialogOpen(false);
        setEditingNote(null);
        setEditNoteBody('');
        setEditNoteScope('general');
        fetchContact(); // Refresh contact data
      } else {
        addNotification({
          type: 'error',
          title: 'Error updating note',
          message: result.error || 'Something went wrong'
        });
      }
    } catch (error) {
      console.error('Error updating note:', error);
      addNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to update note'
      });
    } finally {
      setSavingNote(false);
    }
  };

  // Delete note
  const deleteNote = async (noteId: number) => {
    if (!contactId) return;

    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      const response = await fetch(`/api/contacts/${contactId}/notes/${noteId}`, {
        method: 'DELETE',
        headers: {
          'x-user': JSON.stringify(user)
        }
      });

      const result = await response.json();

      if (result.success) {
        addNotification({
          type: 'success',
          title: 'Note deleted',
          message: 'Note has been deleted successfully'
        });
        fetchContact(); // Refresh contact data
      } else {
        addNotification({
          type: 'error',
          title: 'Error deleting note',
          message: result.error || 'Something went wrong'
        });
      }
    } catch (error) {
      console.error('Error deleting note:', error);
      addNotification({
        type: 'error',
        title: 'Network Error',
        message: 'Failed to delete note'
      });
    }
  };

  // Open edit dialog
  const openEditDialog = (note: Note) => {
    setEditingNote(note);
    setEditNoteBody(note.body);
    setEditNoteScope(note.scope);
    setEditDialogOpen(true);
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'error';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'default';
    }
  };

  // Get scope color
  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'general': return 'primary';
      case 'hemal': return 'secondary';
      case 'yetkin': return 'success';
      case 'private': return 'warning';
      default: return 'default';
    }
  };

  useEffect(() => {
    if (open && contactId) {
      fetchContact();
    }
  }, [open, contactId]);

  const handleClose = () => {
    setContact(null);
    setError(null);
    setTabValue(0);
    setNewNoteBody('');
    setNewNoteScope('general');
    onClose();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={handleClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: { xs: '100%', sm: 600 },
            maxWidth: '100vw'
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" component="div">
              Contact Details
            </Typography>
            <IconButton onClick={handleClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            ) : contact ? (
              <>
                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
                    <Tab icon={<PersonIcon />} label="Details" />
                    <Tab icon={<NotesIcon />} label={`Notes (${contact.notes.length})`} />
                  </Tabs>
                </Box>

                {/* Details Tab */}
                <TabPanel value={tabValue} index={0}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Basic Info */}
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {contact.firstName} {contact.lastName}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip 
                            label={contact.priority} 
                            color={getPriorityColor(contact.priority) as any}
                            size="small"
                          />
                          {contact.seenFilm && (
                            <Chip label="Seen Film" color="success" size="small" />
                          )}
                          {contact.docBranchMember && (
                            <Chip label="Doc Branch Member" color="info" size="small" />
                          )}
                        </Box>

                        {contact.emailPrimary && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">{contact.emailPrimary}</Typography>
                          </Box>
                        )}

                        {contact.emailSecondary && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">{contact.emailSecondary}</Typography>
                          </Box>
                        )}

                        {contact.company && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <BusinessIcon fontSize="small" color="action" />
                            <Typography variant="body2">{contact.company.name}</Typography>
                          </Box>
                        )}

                        {contact.location.cityName && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <LocationIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {[contact.location.cityName, contact.location.stateName, contact.location.countryName]
                                .filter(Boolean).join(', ')}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>

                    {/* Social Links */}
                    {(contact.linkedin || contact.facebook || contact.instagram || contact.imdb || contact.wikipedia) && (
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Social Links
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {contact.linkedin && (
                              <Typography variant="body2">
                                LinkedIn: <a href={contact.linkedin} target="_blank" rel="noopener noreferrer">{contact.linkedin}</a>
                              </Typography>
                            )}
                            {contact.facebook && (
                              <Typography variant="body2">
                                Facebook: <a href={contact.facebook} target="_blank" rel="noopener noreferrer">{contact.facebook}</a>
                              </Typography>
                            )}
                            {contact.instagram && (
                              <Typography variant="body2">
                                Instagram: <a href={contact.instagram} target="_blank" rel="noopener noreferrer">{contact.instagram}</a>
                              </Typography>
                            )}
                            {contact.imdb && (
                              <Typography variant="body2">
                                IMDB: <a href={contact.imdb} target="_blank" rel="noopener noreferrer">{contact.imdb}</a>
                              </Typography>
                            )}
                            {contact.wikipedia && (
                              <Typography variant="body2">
                                Wikipedia: <a href={contact.wikipedia} target="_blank" rel="noopener noreferrer">{contact.wikipedia}</a>
                              </Typography>
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    )}

                    {/* Biography */}
                    {contact.biography && (
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Biography
                          </Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {contact.biography}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Box>
                </TabPanel>

                {/* Notes Tab */}
                <TabPanel value={tabValue} index={1}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Add Note Form */}
                    {canAddNotes && (
                      <Card>
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            Add New Note
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <FormControl size="small">
                              <InputLabel>Scope</InputLabel>
                              <Select
                                value={newNoteScope}
                                onChange={(e) => setNewNoteScope(e.target.value)}
                                label="Scope"
                              >
                                <MenuItem value="general">General</MenuItem>
                                <MenuItem value="hemal">Hemal</MenuItem>
                                <MenuItem value="yetkin">Yetkin</MenuItem>
                                <MenuItem value="private">Private</MenuItem>
                              </Select>
                            </FormControl>
                            <TextField
                              multiline
                              rows={3}
                              placeholder="Enter your note..."
                              value={newNoteBody}
                              onChange={(e) => setNewNoteBody(e.target.value)}
                              fullWidth
                            />
                            <Button
                              variant="contained"
                              onClick={addNote}
                              disabled={addingNote || !newNoteBody.trim()}
                              startIcon={addingNote ? <CircularProgress size={16} /> : <AddIcon />}
                            >
                              {addingNote ? 'Adding...' : 'Add Note'}
                            </Button>
                          </Box>
                        </CardContent>
                      </Card>
                    )}

                    {/* Notes List */}
                    {contact.notes.length === 0 ? (
                      <Card>
                        <CardContent>
                          <Typography variant="body2" color="text.secondary" textAlign="center">
                            No notes yet. {canAddNotes ? 'Add the first note above.' : 'Only editors and admins can add notes.'}
                          </Typography>
                        </CardContent>
                      </Card>
                    ) : (
                      <List>
                        {contact.notes.map((note) => (
                          <Card key={note.id} sx={{ mb: 2 }}>
                            <CardContent>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle2" fontWeight="bold">
                                    {note.author_name}
                                  </Typography>
                                  <Chip 
                                    label={note.scope} 
                                    color={getScopeColor(note.scope) as any}
                                    size="small"
                                  />
                                  {note.is_edited && (
                                    <Chip label="Edited" color="warning" size="small" />
                                  )}
                                </Box>
                                {canEditNote(note) && (
                                  <Box>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => openEditDialog(note)}
                                      sx={{ mr: 1 }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton 
                                      size="small" 
                                      onClick={() => deleteNote(note.id)}
                                      color="error"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                )}
                              </Box>
                              <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                                {note.body}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(note.created_at)}
                                {note.is_edited && note.edited_at && (
                                  <> • Edited: {formatDate(note.edited_at)}</>
                                )}
                              </Typography>
                            </CardContent>
                          </Card>
                        ))}
                      </List>
                    )}
                  </Box>
                </TabPanel>
              </>
            ) : null}
          </Box>
        </Box>
      </Drawer>

      {/* Edit Note Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Note</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl size="small">
              <InputLabel>Scope</InputLabel>
              <Select
                value={editNoteScope}
                onChange={(e) => setEditNoteScope(e.target.value)}
                label="Scope"
              >
                <MenuItem value="general">General</MenuItem>
                <MenuItem value="hemal">Hemal</MenuItem>
                <MenuItem value="yetkin">Yetkin</MenuItem>
                <MenuItem value="private">Private</MenuItem>
              </Select>
            </FormControl>
            <TextField
              multiline
              rows={4}
              placeholder="Enter your note..."
              value={editNoteBody}
              onChange={(e) => setEditNoteBody(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={editNote}
            variant="contained"
            disabled={savingNote || !editNoteBody.trim()}
          >
            {savingNote ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

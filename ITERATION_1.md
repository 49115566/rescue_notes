# RESCUE NOTES Iteration 1

The first iteration of **RESCUE NOTES** includes the following functionality:
- Progressive Web App functionality - usable from any device and platform with near-native functionality
- Local-only note storage (via indexedDB)
- Markdown-style note formatting & exporting
- Non-functional emergency contact demo
- Near complete frontend flow
- Basic and honest how-to-use documentation for the existing functionality

## App Flow

This section outlines the user flow and features for Iteration 1 of RESCUE NOTES. Emergency communication features are non-functional and serve as UI prototypes for future development.

### 1. Home Page
- View all notes
- Search and filter notes
- Create and delete notes
- Open note editor or note view for any note
- Access note-side settings
- Access help page

### 2. Note Editor Page
- Edit note text (markdown syntax)
- Auto-save note after each edit
- Quick access to markdown help
- Switch to note view
- Return to home page
- Access help page

### 3. Note View Page
- View note with rendered markdown
- Switch to note editor
- Return to home page
- Access help page

### 4. Note-Side Settings Page
- Global settings (light/dark mode)
- Placeholder for future note-specific settings
- Return to home page
- Access help page

### 5. Help Page
- Access how-to guides
- Access emergency communication page (disguised)
- Access feedback page
- Return to previous page

### 6. How-To Pages
- Guides for:
    - Using the note app
    - Using help features
    - Markdown syntax (same as editor help)
- Back arrow navigation (no direct links)

### 7. Emergency Communication Page (Frontend Demo)
- First visit redirects to setup page
- Quick emergency services message:
    - Message field
    - Send button (default message if empty)
- Quick emergency contacts message:
    - Message field
    - Send button (default message if empty)
- Access:
    - Emergency services message page
    - Emergency services call page
    - Emergency contacts message page
    - Emergency contacts call page
    - Emergency communication settings
    - Help page

### 8. Emergency Services Message Page
- Select service
- Message field
- Location auto-attached
- Simulated SMS conversation (text-to-911)
- New chat button
- View previous chats
- Return to emergency communication homepage

### 9. Emergency Services Call Page
- 911 call button
- Simulated phone interface:
    - Hang up
    - Audio output selector (normal, speaker, earbuds, bluetooth)
    - Mute
- Return to emergency communication homepage

### 10. Emergency Contacts Message Page
- Simulated messaging app
- Quick-select emergency contacts (from setup/settings)
- Return to emergency communication homepage

### 11. Emergency Contacts Call Page
- Simulated phone app
- Quick-select emergency contacts (from setup/settings)
- Return to emergency communication homepage

### 12. Emergency Communication Setup Page
- Multi-step onboarding:
    - How-to documentation
    - Request location access (if applicable)
    - Request contacts access (if applicable)
    - Set up emergency contacts
    - Set up default emergency message

### 13. Emergency Communication Settings Page
- Global settings (light/dark mode)
- Emergency-side settings:
    - Edit emergency contacts
    - Edit default emergency message
    - Return to emergency communication homepage

---

**Note:**
- All emergency communication features are non-functional in Iteration 1 and serve as UI prototypes.
- No additional functionality has been added beyond what is required for Iteration 1.

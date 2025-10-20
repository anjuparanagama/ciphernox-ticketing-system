# TODO: Add Email Sent Status Column to Participants Table

## Steps to Complete

- [ ] Update server/routes/dashboard.js to include email_sent in SELECT query and alias as emailSent
- [ ] Update client/src/services/api.ts to add emailSent?: boolean to Participant interface
- [ ] Update client/src/pages/Participants.tsx to add "Email Sent" column header in TableHeader
- [ ] Update client/src/pages/Participants.tsx to add TableCell for email sent status with Badge in TableBody

## Followup Steps

- [ ] Test changes by running server and client
- [ ] Verify email_sent status reflects accurately from database

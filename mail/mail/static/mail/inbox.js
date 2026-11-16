document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipients = '') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  console.log(recipients);
  console.log(arguments);
  console.log(arguments[0]);
  console.log(arguments[1]);
  document.querySelector('#compose-recipients').value = recipients;
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
  document.querySelector('#compose-form').addEventListener('submit', function() {

    // Check for recipient(s)
    if (document.querySelector('#compose-recipients').value !== '') {

      // Send form
      const recipients = document.querySelector('#compose-recipients').value;
      const subject = document.querySelector('#compose-subject').value;
      const body = document.querySelector('#compose-body').value;

      send_email(recipients, subject, body);
    }
  })
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Show mail
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);

      // Display emails as rows of a table
      // Create table if none
      let email_table = document.querySelector('table');
      if (!email_table) {
          email_table = document.createElement('table');
          email_table.setAttribute('class', 'table');
          document.querySelector('#emails-view').append(email_table);
      }

      emails.forEach(function(email) {

          // Create table row 
          let row = (document.createElement('tr'));
          email_table.append(row);

          // Add event listener for click
          row.addEventListener('click', function() {
              const emailsView = document.querySelector('#emails-view');
              fetch('/emails/100')
              .then(response => response.json())
              .then(mail => {
                  // Print email
                  console.log(mail);

                  // Clear view
                  emailsView.innerHTML = '';

                  // Display email
                  let from = document.createElement('p');
                  emailsView.append(from);
                  from.innerHTML = `<b>From:</b> ${mail.sender}`;

                  let to = document.createElement('p');
                  emailsView.append(to);

                  // Unpack recipients list
                  let recipients = '';
                  let recipients_count = mail.recipients.length;
                  recipients += mail.recipients[0];

                  for (let i = 1; i < recipients_count; i++) {
                    recipients += `, ${mail.recipients[i]}`;
                  }
                  to.innerHTML = `<b>To:</b> ${recipients}`;
                            
                  let subject = document.createElement('p');
                  emailsView.append(subject);
                  subject.innerHTML = `<b>Subject:</b> ${mail.subject}`;

                  let timestamp = document.createElement('p');
                  emailsView.append(timestamp);
                  timestamp.innerHTML = `<b>Timestamp:</b> ${mail.timestamp}`;

                  // Spacer
                  let spacer = document.createElement('br');
                  emailsView.append(spacer);

                  // Add reply and archive buttons
                  let archive = document.createElement('button');
                  archive.setAttribute('class', 'btn btn-sm btn-outline-primary');
                  archive.setAttribute('id', 'archive');
                  archive.innerHTML = 'Archive';
                  archive.addEventListener('click', function(mail) {
                      fetch(`/emails/${mail.id}`, {
                      method: 'PUT',
                      body: JSON.stringify({
                          archived: true
                      })
                    })
                    .then(response => response.json())
                    .then(response => {})
                    .catch(error => {

                    })
                  });

                  let reply = document.createElement('button');                  
                  reply.setAttribute('class', 'btn btn-sm btn-outline-primary');
                  reply.setAttribute('id', 'reply');
                  reply.innerHTML = 'Reply';
                  
                  let reply_recipients = [];

                  // Add sender to recipients list
                  reply_recipients.push(mail.sender);

                  // Add recipients excluding the current user
                  const user = document.querySelector('h2').innerHTML;
                  for (let i = 0; i < recipients_count; i++) {
                      if (mail.recipients[i] !== user) {
                        reply_recipients.push(mail.recipients[i]);
                      }
                  }              
                  reply.addEventListener('click', () => compose_email(reply_recipients));
                  
                  emailsView.append(archive);
                  emailsView.append(reply);
                  emailsView.append(spacer);

                  // Set status to read
                  fetch('/emails/100', {
                  method: 'PUT',
                  body: JSON.stringify({
                      read: true
                    })
                  })
              })
              .catch(error => {
                  message = 'An error occurred while loading email.';
                  console.log(message);
                  emailsView.innerHTML = message;
              });
          });

          // Populate with sender, subject and timestamp
          let sender = document.createElement('td');
          sender.innerHTML = email.sender;
          let subject = document.createElement('td');
          subject.innerHTML = email.subject;
          let timestamp = document.createElement('td');
          timestamp.innerHTML = email.timestamp;

          row.append(sender);
          row.append(subject);
          row.append(timestamp);
        })
    })
  .catch(error => {
    let message = `An error occurred while loading emails for ${mailbox}.`;
    console.log(message);
    document.querySelector('#emails-view').innerHTML = message;
  });
}

function send_email(recipients, subject, body) {
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
          recipients: recipients,
          subject: subject,
          body: body
      })
    })
    .then(response => response.json())
    .then(result => {
        // Print result
        console.log(result);
        document.querySelector('#emails-view').innerHTML = 'Email sent!';
    })
    .catch(error => {
        let message = 'An error occurred while trying to send the email';
        console.log(message);
        document.querySelector('#emails-view').innerHTML = message;

    });
}
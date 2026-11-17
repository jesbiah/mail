document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    // By default, load the inbox
    load_mailbox('inbox');

    // Add latest Bootstrap
    let latestBootstrap = document.createElement('link');
    latestBootstrap.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@6.0.0-alpha.1/dist/css/bootstrap.min.css');
    latestBootstrap.setAttribute('rel', 'stylesheet');
    latestBootstrap.setAttribute('integrity', 'sha384-B/GM4XqrwHnWXNOWMbloTmrYXZg10cakYGmpfsR/bbzQ6JAJI4ihuyADKLnBgrCe');
    latestBootstrap.setAttribute('crossorigin', 'anonymous');
    let head = document.querySelector('head');

    // add an additional div to inbox.html (in addition to emails-view and compose-view) for displaying the email
    let emailView = document.createElement('div');
    emailView.setAttribute('id', 'email-view');
    let emailsView = document.querySelector('#emails-view');
    let parentNode = emailsView.parentNode;
    parentNode.insertBefore(emailView, emailsView);
    
    // Put before .css file
    let cssFile = document.querySelectorAll('link')[1];
    head.insertBefore(latestBootstrap, cssFile);

    // Add event listeners
    const recipients = document.querySelector('#compose-recipients');
    const subject = document.querySelector('#compose-subject');
    const body = document.querySelector('#compose-body');
    document.querySelector('#compose-form').addEventListener('submit', (event) => {
        send_email(recipients.value, subject.value, body.value);
        load_mailbox('sent');
        event.preventDefault();
    });
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

    // Make a GET request to /emails/<mailbox> to request the emails for a particular mailbox
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(emails => {
            // Print emails
            console.log(emails);

            let email_count = emails.length;
            for (let i = 0; i < email_count; i++) {
                let email = emails[i];

                // Each email should then be rendered in its own box (e.g. as a <div> with a border) 
                // that displays who the email is from, what the subject line is, and the timestamp of the email
                let emailEntry = document.createElement('div');
                let cssClass = 'border p-3';

                // If the email is unread, it should appear with a white background else, it should appear with a gray background
                if (email.read) {
                  cssClass += ' bg-secondary';
                }
                emailEntry.setAttribute('class', cssClass);
                emailEntry.innerHTML = `<b>${email.recipients}</b> ${email.subject} ${email.timestamp}`;
                emailEntry.addEventListener('click', () => {
                    open_email(email.id);
                });
                document.querySelector('#emails-view').append(emailEntry);
            }
        });
    
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    let emailView = document.querySelector('#email-view');
    if (emailView) {
      emailView.style.display = 'none';
    }

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function open_email(id) {

    // make a GET request to /emails/<email_id> to request the email
    fetch(`/emails/${id}`)
        .then(response => response.json())
        .then(email => {
            // Print email
            console.log(email);

            // show the email’s sender, recipients, subject, timestamp, and body
            let emailView = document.querySelector('#email-view');
            emailView.innerHTML = `<p><b>From:</b> ${email.sender}</p>
            <p><b>To:</b> ${email.recipients}</p>
            <p><b>Subject:</b> ${email.subject}</p>
            <p><b>Timestamp:</b> ${email.timestamp}</p>
            <br><hr>
            <p>${email.body}</p>`
            
            // hide and show the right views when navigation options are clicked
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#compose-view').style.display = 'none';
            emailView.style.display = 'block';

            // mark the email as read with a PUT request to /emails/<email_id> to update whether an email is read or not
            fetch(`/emails/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
              })
                      });            
}

function send_email(recipients, subject, body) {

    // Make a POST request to /emails, passing in values for recipients, subject, and body
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
      });
}
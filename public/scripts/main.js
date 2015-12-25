(function () {
  const po = document.createElement('script');
  po.type = 'text/javascript';
  po.async = true;
  po.src = 'https://plus.google.com/js/client:plusone.js?onload=start';
  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(po, s);
}());

function signInCallback(authResult) {
  if (authResult.code) {
    $.ajax({
      url: 'https://www.googleapis.com/plus/v1/people/me',
      beforeSend: (xhr) => {
        xhr.setRequestHeader('Authorization','Bearer ' + authResult.access_token);
      }
    }).done((user) => {
      $.post('/signin', {
        code: authResult.code,
        user: user
      }).done(() => {
        window.location.replace('/apply')
      });
    });
  } else if (authResult.error) {
    console.error('Google+ Signin: ' + authResult.error);
  }
}

import got from 'got';

function slack(url) {
  return function send(payload) {
    return got(url, {
      type: 'POST',
      body: JSON.stringify(payload)
    });
  };
}

export default slack;

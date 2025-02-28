export const FetchPromise = async (MountRoute, data) => {
  return await fetch(
    `${MountRoute}/php/api.php`,
    {
      method: 'POST',
      body: `id=${btoa(JSON.stringify(data))}`,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )
    .then(r => r.ok ? r.json() : { code: -1, message: r.statusText })
    .then(r => r);
};

export const makeid = length => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
};

export const GetSelectionFromElement = element => {
  let selected_text = element.value.trim();

  if(element.selectionStart !== undefined) {
    const { selectionStart, selectionEnd } = element;
    selected_text = element.value.trim().substring(selectionStart, selectionEnd);
  }

  return selected_text;
};
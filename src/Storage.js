class Storage {
  static has(key) {
    return !!localStorage.getItem(key);
  }

  static remove(key) {
    localStorage.removeItem(key);
  }

  static add(key) {
    localStorage.setItem(key, JSON.stringify({}));
  }

  static all() {
    if (window.storage && localStorage.getItem(window.storage)) {
      const json = localStorage.getItem(window.storage);
      const items = JSON.parse(json);
      return items;
    }

    return {};
  }

  static get(key) {
    const items = Storage.all();

    return items[key];
  }

  static set(key, item) {
    if (window.storage) {
      const items = Storage.all();
      items[key] = item;
      localStorage.setItem(window.storage, JSON.stringify(items));
    }
  }

  static destroy(key) {
    if (window.storage) {
      const items = Storage.all();
      delete items[key];
      localStorage.setItem(window.storage, JSON.stringify(items));
    }
  }
}

export default Storage;

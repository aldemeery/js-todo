let storage = 'default';

const Item = (function () {
  function Item(data = {}) {
    this.id = data.id;
    this.title = data.title;
    this.date = new Date(data.date);
    this.priority = data.priority;
    this.done = data.done === undefined ? false : data.done;
  }

  Item.prototype.render = function () {
    const tr = document.createElement('tr');
    tr.setAttribute('data-id', this.id);

    Object.keys(this).forEach((key) => {
      tr.append(this.renderAttribute(key));
    });

    return tr;
  };

  Item.prototype.renderAttribute = function (attribute) {
    const td = document.createElement('td');
    td.setAttribute('data-attr', attribute);

    const text = Item.formatters(attribute).format(this);
    const classes = Item.formatters(attribute).classList(this);
    if (classes) {
      td.classList.add(classes);
    }
    td.innerHTML = text;

    return td;
  };

  Item.formatters = function (attribute) {
    const def = {
      format: (item) => item[attribute],
      classList: () => '',
    };

    const formatters = {
      date: {
        format: (item) => item.date.toISOString().split('T')[0],
      },
      done: {
        classList: (item) => (item.isRead() ? 'green' : 'red'),
        format: (item) => (item.isRead() ? '&check;' : '&times;'),
      },
    };

    return { ...def, ...formatters[attribute] };
  };

  Item.prototype.toggle = function () {
    this.done = !this.done;
  };

  Item.prototype.save = function () {
    if (typeof this.id === 'undefined') {
      const keys = Object.keys(Item.all()).concat([0]);
      this.id = Math.max(...keys) + 1;
    }
    Item.all()[this.id] = this.literal();
  };

  Item.prototype.destroy = function () {
    delete Item.all()[this.id];
  };

  Item.prototype.isRead = function () {
    return this.done;
  };

  Item.prototype.literal = function () {
    return {
      id: this.id,
      title: this.title,
      date: this.date.toISOString().split('T')[0],
      priority: this.priority,
      done: this.done,
    };
  };

  Item.find = function (id) {
    const item = Item.all()[id];
    if (item) {
      return Item.hydrate(item);
    }
    return undefined;
  };

  Item.hydrate = function (item) {
    return new Item(item);
  };

  Item.all = function () {
    const items = window[storage] || (window[storage] = {});
    Object.keys(items).forEach((key) => {
      items[key] = Item.hydrate(items[key]);
    });
    return items;
  };

  Item.destroy = function (id) {
    delete Item.all()[id];
  };

  Item.toArray = function () {
    return Object.values(Item.all());
  };

  return Item;
}());

function render() {
  const body = document.getElementById('body');
  body.innerHTML = '';
  Item.toArray().forEach((item) => {
    const tr = item.render();
    const td = document.createElement('td');
    const remove = document.createElement('a');
    remove.addEventListener('click', (e) => {
      e.preventDefault();
      item.destroy();
      render();
    });
    remove.innerHTML = 'Remove';

    const toggle = document.createElement('a');
    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      item.toggle();
      item.save();
      render();
    });
    toggle.innerHTML = 'Toggle';

    td.append(remove);
    td.appendChild(document.createTextNode(' | '));
    td.append(toggle);

    tr.append(td);
    body.append(tr);
  });
}

function addItemtoLibrary(data) {
  new Item(data).save();
}

const form = document.querySelector('.form');
form.onsubmit = (e) => {
  e.preventDefault();

  const {
    title,
    date,
    priority,
  } = e.target.elements;

  addItemtoLibrary({
    title: title.value,
    date: date.value,
    priority: priority.value,
  });

  e.target.reset();

  render();
};

const switchProject = (e) => {
  e.preventDefault();
  const { name } = e.target.dataset;

  if (window[name]) {
    document.querySelector('.current-project').innerHTML = `(${name})`;
    storage = name;
  }

  render();
};

const deleteProject = (e) => {
  e.preventDefault();

  const { name } = e.target.dataset;

  if (name !== 'default') {
    document.querySelector('.current-project').innerHTML = '(Default)';
    storage = 'default';
    delete window[name];
    e.target.remove();
  }

  render();
};

const projectsForm = document.querySelector('.projects-form');
projectsForm.onsubmit = (e) => {
  e.preventDefault();
  const { title } = e.target.elements;
  const value = title.value.toLowerCase();

  if (!window[value]) {
    window[value] = {};
    const a = document.createElement('a');
    a.href = '#';
    a.classList = 'project-name tooltip';
    a.dataset.name = value;
    a.innerHTML = `${value}<span class="tooltiptext">Right-click to delete</span>`;
    a.addEventListener('contextmenu', deleteProject);
    a.addEventListener('click', switchProject);

    document.querySelector('.projects').appendChild(a);
  }

  e.target.reset();
};

document.querySelectorAll('.project-name').forEach(a => {
  a.addEventListener('contextmenu', deleteProject);
  a.addEventListener('click', switchProject);
});

render();

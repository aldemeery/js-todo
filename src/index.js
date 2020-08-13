import './style.css';
import Item from './Item';

window.storage = 'default';

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

    const edit = document.createElement('a');
    edit.addEventListener('click', (e) => {
      e.preventDefault();

      const form = document.querySelector('.form');
      form.elements.id.value = item.id;
      form.elements.title.value = item.title;
      [form.elements.date.value] = item.date.toISOString().split('T');
      form.elements.priority.value = item.priority;
      form.elements.done.value = item.done;
    });
    edit.innerHTML = 'Edit';

    td.append(remove);
    td.appendChild(document.createTextNode(' | '));
    td.append(toggle);
    td.appendChild(document.createTextNode(' | '));
    td.append(edit);

    tr.append(td);
    body.append(tr);
  });
}

function addItemToLibrary(data) {
  new Item(data).save();
}

const form = document.querySelector('.form');
form.onsubmit = (e) => {
  e.preventDefault();

  const {
    id,
    done,
    title,
    date,
    priority,
  } = e.target.elements;

  addItemToLibrary({
    id: id.value,
    done: done.value,
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
    window.storage = name;
  }

  render();
};

const deleteProject = (e) => {
  e.preventDefault();

  const { name } = e.target.dataset;

  if (name !== 'default') {
    document.querySelector('.current-project').innerHTML = '(Default)';
    window.storage = 'default';
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

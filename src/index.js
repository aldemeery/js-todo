import './style.css';
import Item from './Item';
import Storage from './Storage';

window.storage = 'default';
if (!localStorage.getItem('projects')) {
  localStorage.setItem('projects', '');
}

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

const switchProject = (e) => {
  e.preventDefault();
  const { name } = e.target.dataset;

  if (Storage.has(name) || name === 'default') {
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
    Storage.remove(name);
    const projectsString = localStorage.getItem('projects') || '';
    const projectsArray = projectsString.split(',').filter(i => i);
    if (projectsArray.indexOf(name) > -1) {
      delete projectsArray[projectsArray.indexOf(name)];
    }
    localStorage.setItem('projects', projectsArray.join(','));
    e.target.remove();
  }

  render();
};

function renderProject(value) {
  const a = document.createElement('a');
  a.href = '#';
  a.classList = 'project-name tooltip';
  a.dataset.name = value;
  a.innerHTML = `${value}<span class="tooltiptext">Right-click to delete</span>`;
  a.addEventListener('contextmenu', deleteProject);
  a.addEventListener('click', switchProject);

  return a;
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

const projectsForm = document.querySelector('.projects-form');
projectsForm.onsubmit = (e) => {
  e.preventDefault();
  const { title } = e.target.elements;
  const value = title.value.toLowerCase();

  if (!Storage.has(value)) {
    Storage.add(value);
    const projectsString = localStorage.getItem('projects') || '';
    const values = projectsString.split(',');
    values.push(value);
    localStorage.setItem('projects', values.join(','));

    document.querySelector('.projects').appendChild(renderProject(value));
  }

  e.target.reset();
};

document.querySelectorAll('.project-name').forEach(a => {
  a.addEventListener('contextmenu', deleteProject);
  a.addEventListener('click', switchProject);
});

const projects = document.querySelector('.projects');
localStorage.getItem('projects').split(',').forEach(name => {
  if (name) {
    projects.appendChild(renderProject(name));
  }
});

render();

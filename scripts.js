/** @format */

'use strict';

function changeTextCapitalization(text, format) {
  switch (format) {
    case 'upper':
      return text.toLocaleUpperCase();
    case 'lower':
      return text.toLocaleLowerCase();
    case 'first':
      return text && text[0].toLocaleUpperCase() + text.slice(1).toLocaleLowerCase();
    case 'title':
      return text.replace(/(^\w|\s\w)(\S*)/g, (_, m1, m2) => m1.toLocaleUpperCase() + m2.toLocaleLowerCase());
    default:
      return text;
  }
}

function buildTemplate(external, heading, subheading, description) {
  const template = document.querySelector('#template').content.cloneNode(true);
  if (external === false) template.querySelector('#template_external').remove();
  heading === '' ? template.querySelector('#template_heading').remove() : (template.querySelector('#template_heading').innerHTML = heading);
  subheading === '' ? template.querySelector('#tmplate_subheading').remove() : (template.querySelector('#template_subheading').innerHTML = subheading);
  description === '' ? template.querySelector('#template_description').remove() : (template.querySelector('#template_description').innerHTML = description);
  if (external === false) template.querySelector('#template_heading').classList.remove('group-hover:text-gray-500');
  return template;
}

function buildList(items) {
  return `<ul>${items.map((item) => '<li class="list-chevron">' + item + '</li>').join('')}</ul>`;
}

function buildLink(text, link) {
  return `<a href="${link}" target="_blank">${text}</a>`;
}

function buildPills(items) {
  return items.map((content) => `<span class="inline-flex items-center pr-5 py-0.5 rounded-full">${content}</span>`).join('');
}

function renderFullName(obj) {
  const full_name = changeTextCapitalization(obj.format.pattern.replaceAll('f', obj.first_name).replaceAll('m', obj.middle_name).replaceAll('l', obj.last_name), obj.format.case);
  document.querySelector('#full_name').innerText = full_name;
  document.title = full_name;
}

function renderDescription(str) {
  document.querySelector('#description').innerText = str;
}

function renderContact(obj) {
  const items = [];
  if (obj.phone !== '') items.push(buildLink(obj.phone, `tel:${obj.phone}`));
  if (obj.email !== '') items.push(buildLink(obj.email, `mailto:${obj.email}`));
  if (obj.website !== '') items.push(buildLink(obj.website, obj.website));
  document.querySelector('#contact').innerHTML = items.join('&nbsp;&nbsp;·&nbsp;&nbsp;');
}

function renderExperiences(obj) {
  for (const entry of obj) {
    const heading = entry.role;
    const subheading = `${entry.company} | ${entry.date.begin} - ${entry.date.end}`;
    const description = entry.description.length <= 1 ? entry.description[0] ?? '' : buildList(entry.description);
    document.querySelector('#experiences').append(buildTemplate(false, heading, subheading, description));
  }
}

function renderEducation(obj) {
  for (const entry of obj) {
    const heading = entry.field;
    const subheading = `${entry.institution} | ${entry.date.begin} - ${entry.date.end}`;
    const description = '';
    document.querySelector('#education').append(buildTemplate(false, heading, subheading, description));
  }
}

function renderProjects(obj) {
  for (const entry of obj) {
    const heading = entry.link === '' ? entry.name : buildLink(entry.name, entry.link);
    const subheading = entry.stacks.length < 1 ? '' : buildPills(entry.stacks);
    const description = entry.description.length <= 1 ? entry.description[0] ?? '' : buildList(entry.description);
    document.querySelector('#projects').append(buildTemplate(entry.link !== '', heading, subheading, description));
  }
}

function renderCertifications(obj) {
  for (const entry of obj) {
    const heading = entry.name;
    const subheading = `${entry.issuer} | ${entry.date.issued} ${entry.date.expiry === '' ? '' : '-'} ${entry.date.expiry}`;
    const description = '';
    document.querySelector('#certifications').append(buildTemplate(false, heading, subheading, description));
  }
}

window.onload = () => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.toggle('dark');

  fetch('./content.json')
    .then((response) => response.json())
    .then((data) => {
      renderFullName(data.info.full_name);
      renderDescription(data.info.description);
      renderContact(data.info.contact);

      if ('experiences' in data) {
        // {
        //   "role": "",
        //   "company": "",
        //   "date": {
        //     "begin": "",
        //     "end": ""
        //   },
        //   "description": [""]
        // }
        renderExperiences(data.experiences);
      } else {
        document.querySelector('#experiences').parentElement.remove();
      }

      if ('education' in data) {
        // {
        //   "field": "",
        //   "institution": "",
        //   "date": {
        //     "begin": "",
        //     "end": ""
        //   }
        // }
        renderEducation(data.education);
      } else {
        document.querySelector('#education').parentElement.remove();
      }

      if ('projects' in data) {
        // {
        //   "name": "",
        //   "link": "",
        //   "stacks": [""],
        //   "description": [""]
        // }
        renderProjects(data.projects);
      } else {
        document.querySelector('#projects').parentElement.remove();
      }

      if ('certifications' in data) {
        // {
        //   "name": "",
        //   "issuer": "",
        //   "date": {
        //     "issued": "",
        //     "expiry": ""
        //   }
        // }
        renderCertifications(data.certifications);
      } else {
        document.querySelector('#certifications').parentElement.remove();
      }
    })
    .catch((error) => alert(error));
};

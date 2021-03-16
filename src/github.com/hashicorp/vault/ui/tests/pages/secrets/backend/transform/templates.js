import { create, clickable, fillable, visitable } from 'ember-cli-page-object';
import ListView from 'vault/tests/pages/components/list-view';

export default create({
  ...ListView,
  visit: visitable('/vault/secrets/:backend/list?tab=templates'),
  visitCreate: visitable('/vault/secrets/:backend/create?itemType=template'),
  createLink: clickable('[data-test-secret-create="true"]'),
  editLink: clickable('[data-test-edit-link="true"]'),
  deleteLink: clickable('[data-test-transformation-template-delete]'),
  name: fillable('[data-test-input="name"]'),
  pattern: fillable('[data-test-input="pattern"'),
  alphabet: fillable('[data-test-input="alphabet"'),
  submit: clickable('[data-test-template-transform-create="true"]'),
  removeAlphabet: clickable('#alphabet [data-test-selected-list-button="delete"]'),
});
